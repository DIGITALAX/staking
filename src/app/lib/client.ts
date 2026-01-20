import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const getEthUnstakeUri = () => {
  if (typeof window === "undefined") {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    return `${baseUrl}/api/graphql/unstake-eth`;
  }
  return "/api/graphql/unstake-eth";
};

const httpLinkEthUnstake = new HttpLink({
  uri: getEthUnstakeUri(),
});

export const graphClient = new ApolloClient({
  link: httpLinkEthUnstake,
  cache: new InMemoryCache(),
});

const getPolyUnstakeUri = () => {
  if (typeof window === "undefined") {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    return `${baseUrl}/api/graphql/unstake-poly`;
  }
  return "/api/graphql/unstake-poly";
};

const polyUnstakeLink = new HttpLink({
  uri: getPolyUnstakeUri(),
});

export const graphPolyUnstakeClient = new ApolloClient({
  link: polyUnstakeLink,
  cache: new InMemoryCache(),
});
