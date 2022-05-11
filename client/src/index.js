import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from "@apollo/client";
import { RetryLink } from '@apollo/client/link/retry';

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
  cache: new InMemoryCache(),
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
