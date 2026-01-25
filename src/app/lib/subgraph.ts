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
  symbol?: string | null;
  decimals?: number | null;
  chainId: number;
  standard: string;
  contractAddress: string;
  totalSupply: string;
  transferCount: string;
  holderCount: number;
  availableToMint?: string | null;
  freezeCap?: boolean | null;
  cap?: string | null;
};

export type SubgraphTokensResponse = {
  tokens: SubgraphToken[];
};

export type SubgraphTokenResponse = {
  token: SubgraphToken | null;
};

export type SubgraphTokenHolder = {
  id: string;
  token: { id: string };
  address: string;
  balance: string;
};

export type SubgraphTokenHoldersResponse = {
  tokenHolders: SubgraphTokenHolder[];
};

export type SubgraphTokenTransfer = {
  id: string;
  token: { id: string };
  from: string;
  to: string;
  amount: string;
  tokenId?: string | null;
  timestamp: string;
  txHash: string;
  blockNumber: string;
};

export type SubgraphTokenTransfersResponse = {
  tokenTransfers: SubgraphTokenTransfer[];
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
        symbol
        decimals
        chainId
        standard
        contractAddress
        totalSupply
        transferCount
        holderCount
        availableToMint
        freezeCap
        cap
      }
    }
  `,
  tokenById: `
    query Token($id: ID!) {
      token(id: $id) {
        id
        name
        symbol
        decimals
        chainId
        standard
        contractAddress
        totalSupply
        transferCount
        holderCount
        availableToMint
        freezeCap
        cap
      }
    }
  `,
  tokenTransfers: `
    query TokenTransfers($token: String!, $first: Int = 10) {
      tokenTransfers(
        first: $first
        orderBy: timestamp
        orderDirection: desc
        where: { token: $token }
      ) {
        id
        token { id }
        from
        to
        amount
        tokenId
        timestamp
        txHash
        blockNumber
      }
    }
  `,
  tokenHoldersByAddress: `
    query TokenHoldersByAddress($token: String!, $address: Bytes!) {
      tokenHolders(where: { token: $token, address: $address }) {
        id
        token { id }
        address
        balance
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
