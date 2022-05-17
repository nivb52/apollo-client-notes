window.logger = console.log

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from, makeVar, split } from "@apollo/client";
import { RetryLink } from '@apollo/client/link/retry';
// ws link
// import { GraphQLWsLink } from "@apollo/client/link/subscriptions"; // new method
// import { createClient } from "graphql-ws"; // new method
import { WebSocketLink } from "@apollo/client/link/ws"; // old method
import { SubscriptionClient } from "subscriptions-transport-ws"; // old method
import { getMainDefinition } from '@apollo/client/utilities';
import { persistCache, LocalStorageWrapper } from "apollo3-cache-persist";

const selectedNoteIds$ = makeVar([]);
const wsLink = new WebSocketLink(
  new SubscriptionClient("ws://localhost:4000/graphql", {
    options: {
      reconnect: true,
    },
  })
);

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql"
});

const protocolLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription' // only subscriptions (not "query" or "mutation")
    );
  },
  wsLink,
  httpLink,
);

const retryLink = new RetryLink({
  delay: {
    initial: 2000,
    max: 2000, /** retry after x seconds */
    jitter: true /** set to true to randomize the delay by +/- 50% */
  }
});

const client = new ApolloClient({
  defaultOptions: {
    // query type for (all) useQuery
    watchQuery: {
      fetchPolicy: 'cache-and-network', // get cache and also update
      nextFetchPolicy: 'cache-first', // revert to default
    }
  },
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          notes: {
            keyArgs: ["categoryId"],
            merge(existing = [], incoming = []) {
              return [...existing, ...incoming];
            },
          },
          note: {
            // cache redirect policy
            read: (existingCachedVal, helpers) => {
              const queriedNoteId = helpers.args.id;
              return helpers.toReference({
                __typename: "Note",
                id: queriedNoteId,
              }); // equivelant to { __ref: `Note${queriedNoteId}`}
            },
          },
        },
      },
      Note: {
        fields: {
          isSelected: {
            read: (currIsCheckedValue, helpers) => {
              const id = helpers.readField("id");
              return selectedNoteIds$().includes(id);
            },
          },
        },
      },
    },
  }),
  link: from([retryLink, protocolLink]),
});


persistCache({
  cache: client.cache,
  storage: new LocalStorageWrapper(window.localStorage),
})
  .then((_) => logger("Restoring from cahce"))
  .catch((err) => logger("Failed to restore from cache, ", err.message))
  .finally(() => {
    ReactDOM.render(
      <React.StrictMode>
        <ChakraProvider>
          <ApolloProvider client={client}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ApolloProvider>
        </ChakraProvider>
      </React.StrictMode>,
      document.getElementById("root")
    );
  });




export const selectNoteHandler = (noteId, isSelected) => {
  logger(`note.id: ` + noteId, `  isSelected: ` + isSelected);
  const currSelectedNotes = selectedNoteIds$();
  if (isSelected) {
    currSelectedNotes.push(noteId); //using reference 
  } else selectedNoteIds$(currSelectedNotes.filter((id) => id !== noteId));
};