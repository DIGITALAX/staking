import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const getQuiltoideUri = () => {
  if (typeof window === "undefined") {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    return `${baseUrl}/api/graphql/quiltoide`;
  }
  return "/api/graphql/quiltoide";
};

const httpLinkQuiltoide = new HttpLink({
  uri: getQuiltoideUri(),
});

export const graphClient = new ApolloClient({
  link: httpLinkQuiltoide,
  cache: new InMemoryCache(),
});

const polyUnstakeLink = new HttpLink({
  uri: `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_KEY}/subgraphs/id/DcGz9H9k4fNnTLP86GJmTRCQ3jmfrT6bSemgmsiXJjt8`,
});

export const graphPolyUnstakeClient = new ApolloClient({
  link: polyUnstakeLink,
  cache: new InMemoryCache(),
});

const ethUnstakeLink = new HttpLink({
  uri: `https://gateway.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_KEY}/subgraphs/id/9PvEAfH671uAzzDmgkkYausJgoB1CXKvziTMaaxtMCF1`,
});

export const graphEthUnstakeClient = new ApolloClient({
  link: ethUnstakeLink,
  cache: new InMemoryCache(),
});
