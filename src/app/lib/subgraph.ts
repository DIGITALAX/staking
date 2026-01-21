export type SubgraphEndpointKey = "eth" | "poly";



export type SubgraphPool = {
  id: string;
  name: string;
  chainId: number;
  kind: string;
  stakersCount?: number | null;
  totalClaims?: string | null;
  totalStaked?: string | null;
};

export type SubgraphStaker = {
  id: string;
  pool: { id: string };
  address: string;
  stakedCount?: string | null;
  rewardsClaimed?: string | null;
};

export type SubgraphPoolsResponse = {
  pools: SubgraphPool[];
};

export type SubgraphPoolResponse = {
  pool: SubgraphPool | null;
};

export type SubgraphStakerResponse = {
  staker: SubgraphStaker | null;
};

export type SubgraphStakersByAddressResponse = {
  stakers: SubgraphStaker[];
};

export type SubgraphToken = {
  id: string;
  name: string;
  chainId: number;
  standard: string;
  contractAddress: string;
  totalSupply: string;
  transferCount: string;
  holderCount: number;
};

export type SubgraphTokensResponse = {
  tokens: SubgraphToken[];
};

export const SUBGRAPH_QUERIES = {
  pools: `
    query Pools {
      pools {
        id
        name
        chainId
        kind
        stakersCount
        totalClaims
        totalStaked
      }
    }
  `,
  poolById: `
    query Pool($id: ID!) {
      pool(id: $id) {
        id
        name
        chainId
        kind
        stakersCount
        totalClaims
        totalStaked
      }
    }
  `,
  stakerById: `
    query Staker($id: ID!) {
      staker(id: $id) {
        id
        address
        stakedCount
        rewardsClaimed
        pool { id }
      }
    }
  `,
  stakersByAddress: `
    query StakersByAddress($address: Bytes!) {
      stakers(where: { address: $address }) {
        id
        address
        stakedCount
        rewardsClaimed
        pool { id }
      }
    }
  `,
  tokens: `
    query Tokens {
      tokens {
        id
        name
        chainId
        standard
        contractAddress
        totalSupply
        transferCount
        holderCount
      }
    }
  `,
};

export async function fetchSubgraph<T>(
  endpoint: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!endpoint) {
    throw new Error("SUBGRAPH_ENDPOINT_MISSING");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error("SUBGRAPH_REQUEST_FAILED");
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "SUBGRAPH_RESPONSE_ERROR");
  }

  if (!payload.data) {
    throw new Error("SUBGRAPH_EMPTY_RESPONSE");
  }

  return payload.data;
}
