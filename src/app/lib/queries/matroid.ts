export type MatroidGlobal = {
  id: string;
  totalStaked?: string | null;
  rewardNotifiedTotal?: string | null;
  stakerCount?: number | null;
  totalDeposited?: string | null;
  targetTotal?: string | null;
  targetDuration?: string | null;
  claimWindow?: string | null;
  distributionStart?: string | null;
  totalDistributed?: string | null;
  baseBudget?: string | null;
  perProjectBudget?: string | null;
  mona?: string | null;
  registry?: string | null;
  globalPool?: string | null;
  slashingContract?: string | null;
};

export type MatroidGlobalResponse = {
  globals: MatroidGlobal[];
};

export type MatroidStaker = {
  id: string;
  user: string;
  stakedAmount: string;
};

export type MatroidGlobalStakersResponse = {
  stakers: MatroidStaker[];
};

export type MatroidProjectMetadata = {
  id: string;
  title?: string | null;
  image?: string | null;
  description?: string | null;
};

export type MatroidProject = {
  id: string;
  metadata?: MatroidProjectMetadata | null;
};

export type MatroidWhitelistedNft = {
  id: string;
  nft: string;
  weight: string;
};

export type MatroidProjectPoolERC20 = {
  id: string;
  project: MatroidProject;
  totalStaked?: string | null;
  rewardTokens?: string[] | null;
  stakerCount?: number | null;
};

export type MatroidProjectPoolNFT = {
  id: string;
  project: MatroidProject;
  totalWeight?: string | null;
  rewardTokens?: string[] | null;
  stakerCount?: number | null;
  whitelistCount?: number | null;
  whitelistedNfts?: MatroidWhitelistedNft[] | null;
};

export type MatroidProjectPoolsResponse = {
  projectPoolERC20s: MatroidProjectPoolERC20[];
  projectPoolNFTs: MatroidProjectPoolNFT[];
};

export type MatroidERC20Staker = {
  id: string;
  pool: { id: string };
  user: string;
  stakedAmount: string;
};

export type MatroidNFTStaker = {
  id: string;
  pool: { id: string };
  user: string;
  totalWeight: string;
  tokenIds: string[];
};

export type MatroidERC20StakersResponse = {
  erc20Stakers: MatroidERC20Staker[];
};

export type MatroidNFTStakersResponse = {
  nftStakers: MatroidNFTStaker[];
};

export const MATROID_QUERIES = {
  global: `
    query Global {
      globals(first: 1) {
        totalStaked
        rewardNotifiedTotal
        stakerCount
        totalDeposited
        targetTotal
        targetDuration
        claimWindow
        distributionStart
        totalDistributed
        baseBudget
        perProjectBudget
        mona
        registry
        globalPool
        slashingContract
      }
    }
  `,
  globalStakers: `
    query GlobalStakers($user: Bytes!) {
      stakers(where: { user: $user }) {
        id
        user
        stakedAmount
      }
    }
  `,
  projectPools: `
    query ProjectPools {
      projectPoolERC20s {
        id
        project {
          id
          metadata {
            id
            title
            image
            description
          }
        }
        totalStaked
        rewardTokens
        stakerCount
      }
      projectPoolNFTs {
        id
        project {
          id
          metadata {
            id
            title
            image
            description
          }
        }
        totalWeight
        rewardTokens
        stakerCount
        whitelistCount
        whitelistedNfts {
          id
          nft
          weight
        }
      }
    }
  `,
  erc20StakersByUser: `
    query ERC20Stakers($user: Bytes!) {
      erc20Stakers(where: { user: $user }) {
        id
        user
        stakedAmount
        pool { id }
      }
    }
  `,
  nftStakersByUser: `
    query NFTStakers($user: Bytes!) {
      nftStakers(where: { user: $user }) {
        id
        user
        totalWeight
        tokenIds
        pool { id }
      }
    }
  `,
};
