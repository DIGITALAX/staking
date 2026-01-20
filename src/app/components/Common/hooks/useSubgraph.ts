import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  SUBGRAPH_QUERIES,
  SubgraphPoolResponse,
  SubgraphPoolsResponse,
  SubgraphStakerResponse,
  SubgraphStakersByAddressResponse,
  SubgraphTokensResponse,
  fetchSubgraph,
} from "@/app/lib/subgraph";

export const useSubgraphStatus = (endpoint?: string) => {
  const hasEndpoint = Boolean(endpoint);
  return {
    endpoint: endpoint || "",
    hasEndpoint,
  };
};

export const useSubgraphPools = (endpoint?: string) => {
  const { hasEndpoint } = useSubgraphStatus(endpoint);
  const query = useQuery({
    queryKey: ["subgraph", "pools", endpoint],
    queryFn: () =>
      fetchSubgraph<SubgraphPoolsResponse>(
        endpoint || "",
        SUBGRAPH_QUERIES.pools,
      ),
    enabled: hasEndpoint,
    staleTime: 60_000,
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

export const useSubgraphPool = (endpoint?: string, poolId?: string) => {
  const { hasEndpoint } = useSubgraphStatus(endpoint);
  return useQuery({
    queryKey: ["subgraph", "pool", endpoint, poolId],
    queryFn: () =>
      fetchSubgraph<SubgraphPoolResponse>(endpoint || "", SUBGRAPH_QUERIES.poolById, {
        id: poolId,
      }),
    enabled: hasEndpoint && Boolean(poolId) && Boolean(endpoint),
    staleTime: 60_000,
  });
};

export const useSubgraphStaker = (endpoint?: string, stakerId?: string) => {
  const { hasEndpoint } = useSubgraphStatus(endpoint);
  return useQuery({
    queryKey: ["subgraph", "staker", endpoint, stakerId],
    queryFn: () =>
      fetchSubgraph<SubgraphStakerResponse>(
        endpoint || "",
        SUBGRAPH_QUERIES.stakerById,
        {
          id: stakerId,
        },
      ),
    enabled: hasEndpoint && Boolean(stakerId) && Boolean(endpoint),
    staleTime: 60_000,
  });
};

export const useSubgraphStakersByAddress = (
  endpoint?: string,
  address?: string,
) => {
  const { hasEndpoint } = useSubgraphStatus(endpoint);
  return useQuery({
    queryKey: ["subgraph", "stakers", endpoint, address],
    queryFn: () =>
      fetchSubgraph<SubgraphStakersByAddressResponse>(
        endpoint || "",
        SUBGRAPH_QUERIES.stakersByAddress,
        { address },
      ),
    enabled: hasEndpoint && Boolean(address) && Boolean(endpoint),
    staleTime: 60_000,
  });
};

export const useSubgraphTokens = (endpoint?: string) => {
  const { hasEndpoint } = useSubgraphStatus(endpoint);
  return useQuery({
    queryKey: ["subgraph", "tokens", endpoint],
    queryFn: () =>
      fetchSubgraph<SubgraphTokensResponse>(
        endpoint || "",
        SUBGRAPH_QUERIES.tokens,
      ),
    enabled: hasEndpoint && Boolean(endpoint),
    staleTime: 60_000,
  });
};
