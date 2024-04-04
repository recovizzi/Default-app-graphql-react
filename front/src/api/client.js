import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";

const httpLinkMain = new HttpLink({
    uri: "http://localhost:4000/graphql/",
});

const httpLinkAuth = new HttpLink({
    uri: "http://localhost:4001/graphql/",
});

export const client = new ApolloClient({
    link: ApolloLink.split(
        (operation) => operation.getContext().clientName === "auth",
        httpLinkAuth,
        httpLinkMain
    ),
    cache: new InMemoryCache(),
});
