window.logger = console.log

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from, makeVar } from "@apollo/client";
import { RetryLink } from '@apollo/client/link/retry';

const selectedNoteIds$ = makeVar([]);

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql"
});

const retryLink = new RetryLink({
  delay: {
    initial: 2000,
    max: 2000, /** retry after x seconds */
    jitter: true /** set to true to randomize the delay by +/- 50% */
  }
});

const client = new ApolloClient({
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
            }
          }
        }
      },
      Note: {
        fields: {
          isSelected: {
            read: (currIsCheckedValue, helpers) => {
              const id = helpers.readField("id");              
              return selectedNoteIds$().includes(id);
            },
          }
        }
      }
    }
  }),
  link: from([retryLink, httpLink])
});

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



export const selectNoteHandler = (noteId, isSelected) => {
  logger(`note.id: ` + noteId, `  isSelected: ` + isSelected);
  const currSelectedNotes = selectedNoteIds$();
  if (isSelected) {
    currSelectedNotes.push(noteId); //using reference 
  } else selectedNoteIds$(currSelectedNotes.filter((id) => id !== noteId));
};