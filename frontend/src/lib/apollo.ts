import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        console.error(
          `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`,
          operation,
          err
        );
      }
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`, operation);
    }
    return forward(operation);
  }
);

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 3000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => !!error,
  },
});

export const client = new ApolloClient({
  link: from([retryLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
