import { useQuery } from "@tanstack/react-query";
import { gql } from "@apollo/client";
import { graphClient } from "@/app/lib/client";
import {
  MATROID_QUERIES,
  MatroidGlobalResponse,
  MatroidGlobalStakersResponse,
  MatroidProjectPoolsResponse,
  MatroidERC20StakersResponse,
  MatroidNFTStakersResponse,
} from "@/app/lib/queries/matroid";
export const useMatroidGlobal = () => {
  return useQuery({
    queryKey: ["matroid", "global"],
    queryFn: async () => {
      const result = await graphClient.query<MatroidGlobalResponse>({
        query: gql(MATROID_QUERIES.global),
      });
      return result.data?.globals?.[0] ?? null;
    },
    staleTime: 60_000,
  });
};

export const useMatroidGlobalStakers = (user?: string) => {
  return useQuery({
    queryKey: ["matroid", "globalStakers", user],
    queryFn: async () => {
      const result = await graphClient.query<MatroidGlobalStakersResponse>({
        query: gql(MATROID_QUERIES.globalStakers),
        variables: { user },
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: Boolean(user),
  });
};

export const useMatroidProjectPools = () => {
  return useQuery({
    queryKey: ["matroid", "projectPools"],
    queryFn: async () => {
      const result = await graphClient.query<MatroidProjectPoolsResponse>({
        query: gql(MATROID_QUERIES.projectPools),
      });
      return result.data;
    },
    staleTime: 60_000,
  });
};

export const useMatroidErc20Stakers = (user?: string) => {
  return useQuery({
    queryKey: ["matroid", "erc20Stakers", user],
    queryFn: async () => {
      const result = await graphClient.query<MatroidERC20StakersResponse>({
        query: gql(MATROID_QUERIES.erc20StakersByUser),
        variables: { user },
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: Boolean(user),
  });
};

export const useMatroidNftStakers = (user?: string) => {
  return useQuery({
    queryKey: ["matroid", "nftStakers", user],
    queryFn: async () => {
      const result = await graphClient.query<MatroidNFTStakersResponse>({
        query: gql(MATROID_QUERIES.nftStakersByUser),
        variables: { user },
      });
      return result.data;
    },
    staleTime: 60_000,
    enabled: Boolean(user),
  });
};
