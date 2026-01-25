import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  SUBGRAPH_QUERIES,
  SubgraphPoolResponse,
  SubgraphPoolsResponse,
  SubgraphStakerResponse,
  SubgraphStakersByAddressResponse,
  SubgraphTokensResponse,
  SubgraphTokenResponse,
  SubgraphTokenTransfersResponse,
  SubgraphTokenHoldersResponse,
  SubgraphEndpointKey,
} from "@/app/lib/subgraph";
import {
  graphPolyUnstakeClient,
  graphEthUnstakeClient,
} from "@/app/lib/client";
import { gql } from "@apollo/client";

const getClientByKey = (key?: SubgraphEndpointKey) => {
  if (key === "poly") return graphPolyUnstakeClient;
  if (key === "eth") return graphEthUnstakeClient;
  return null;
};

export const useSubgraphPools = (key?: SubgraphEndpointKey) => {
  const query = useQuery({
    queryKey: ["subgraph", "pools", key],
    queryFn: async () => {
      const client = getClientByKey(key);
      if (!client) throw new Error("SUBGRAPH_CLIENT_MISSING");
      const result = await client.query<SubgraphPoolsResponse>({
        query: gql(SUBGRAPH_QUERIES.pools),
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: !!key,
  });

  const totals = useMemo(() => {
    if (!query.data?.pools?.length) {
      return { stakers: null, claims: null, staked: null };
    }

    const stakers = query.data.pools.reduce((acc, pool) => {
      return acc + (pool.stakersCount || 0);
    }, 0);

    const claims = query.data.pools.reduce((acc, pool) => {
      const value = pool.totalClaims ? BigInt(pool.totalClaims) : 0n;
      return acc + value;
    }, 0n);

    const staked = query.data.pools.reduce((acc, pool) => {
      const value = pool.totalStaked ? BigInt(pool.totalStaked) : 0n;
      return acc + value;
    }, 0n);

    return { stakers, claims, staked };
  }, [query.data]);

  return {
    ...query,
    totals,
  };
};

export const useSubgraphPool = (
  key?: SubgraphEndpointKey,
  poolId?: string,
) => {
  return useQuery({
    queryKey: ["subgraph", "pool", key, poolId],
    queryFn: async () => {
      const client = getClientByKey(key);
      if (!client) throw new Error("SUBGRAPH_CLIENT_MISSING");
      const result = await client.query<SubgraphPoolResponse>({
        query: gql(SUBGRAPH_QUERIES.poolById),
        variables: { id: poolId },
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: !!key && !!poolId,
  });
};

export const useSubgraphStaker = (
  key?: SubgraphEndpointKey,
  stakerId?: string,
) => {
  return useQuery({
    queryKey: ["subgraph", "staker", key, stakerId],
    queryFn: async () => {
      const client = getClientByKey(key);
      if (!client) throw new Error("SUBGRAPH_CLIENT_MISSING");
      const result = await client.query<SubgraphStakerResponse>({
        query: gql(SUBGRAPH_QUERIES.stakerById),
        variables: { id: stakerId },
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: !!key && !!stakerId,
  });
};

export const useSubgraphStakersByAddress = (
  key?: SubgraphEndpointKey,
  address?: string,
) => {
  return useQuery({
    queryKey: ["subgraph", "stakers", key, address],
    queryFn: async () => {
      const client = getClientByKey(key);
      if (!client) throw new Error("SUBGRAPH_CLIENT_MISSING");
      const result = await client.query<SubgraphStakersByAddressResponse>({
        query: gql(SUBGRAPH_QUERIES.stakersByAddress),
        variables: { address },
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: !!key && !!address,
  });
};

export const useSubgraphTokens = (key?: SubgraphEndpointKey) => {
  return useQuery({
    queryKey: ["subgraph", "tokens", key],
    queryFn: async () => {
      const client = getClientByKey(key);
      if (!client) throw new Error("SUBGRAPH_CLIENT_MISSING");
      const result = await client.query<SubgraphTokensResponse>({
        query: gql(SUBGRAPH_QUERIES.tokens),
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: !!key,
  });
};

export const useSubgraphToken = (
  key?: SubgraphEndpointKey,
  id?: string,
) => {
  return useQuery({
    queryKey: ["subgraph", "token", key, id],
    queryFn: async () => {
      const client = getClientByKey(key);
      if (!client) throw new Error("SUBGRAPH_CLIENT_MISSING");
      const result = await client.query<SubgraphTokenResponse>({
        query: gql(SUBGRAPH_QUERIES.tokenById),
        variables: { id },
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: !!key && !!id,
  });
};

export const useSubgraphTokenTransfers = (
  key?: SubgraphEndpointKey,
  token?: string,
  first = 10,
) => {
  return useQuery({
    queryKey: ["subgraph", "tokenTransfers", key, token, first],
    queryFn: async () => {
      const client = getClientByKey(key);
      if (!client) throw new Error("SUBGRAPH_CLIENT_MISSING");
      const result = await client.query<SubgraphTokenTransfersResponse>({
        query: gql(SUBGRAPH_QUERIES.tokenTransfers),
        variables: { token, first },
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: !!key && !!token,
  });
};

export const useSubgraphTokenHoldersByAddress = (
  key?: SubgraphEndpointKey,
  token?: string,
  address?: string,
) => {
  return useQuery({
    queryKey: ["subgraph", "tokenHolders", key, token, address],
    queryFn: async () => {
      const client = getClientByKey(key);
      if (!client) throw new Error("SUBGRAPH_CLIENT_MISSING");
      const result = await client.query<SubgraphTokenHoldersResponse>({
        query: gql(SUBGRAPH_QUERIES.tokenHoldersByAddress),
        variables: { token, address },
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: !!key && !!token && !!address,
  });
};
