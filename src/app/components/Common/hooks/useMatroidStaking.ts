import { useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { isAddress, parseUnits, type Abi } from "viem";
import { ABIS } from "@/app/abis";
import { MATROID_ADDRESSES, MATROID_CHAIN_ID } from "@/app/lib/constants";

const RATE_SCALE = 10n ** 18n;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const toNow = () => BigInt(Math.floor(Date.now() / 1000));

const rewardPerToken = (
  totalStaked: bigint,
  rewardPerTokenStored: bigint,
  lastUpdateTime: bigint,
  rewardRate: bigint,
  periodFinish: bigint,
  now: bigint,
) => {
  if (totalStaked === 0n) return rewardPerTokenStored;
  const lastTime = now < periodFinish ? now : periodFinish;
  if (lastTime <= lastUpdateTime) return rewardPerTokenStored;
  const delta = lastTime - lastUpdateTime;
  return rewardPerTokenStored + (delta * rewardRate) / totalStaked;
};

const earned = (
  staked: bigint,
  pendingRewards: bigint,
  rewardPerTokenStored: bigint,
  userRewardPerTokenPaid: bigint,
) => {
  if (staked === 0n) return pendingRewards;
  const delta = rewardPerTokenStored - userRewardPerTokenPaid;
  return pendingRewards + (staked * delta) / RATE_SCALE;
};

export const useMatroidGlobalStaking = () => {
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const poolAddress = MATROID_ADDRESSES.globalStakingPool;
  const monaAddress = MATROID_ADDRESSES.mona;
  const isPoolReady = isAddress(poolAddress) && poolAddress !== ZERO_ADDRESS;
  const isMonaReady = isAddress(monaAddress);

  const commonRead = {
    address: poolAddress as `0x${string}`,
    chainId: MATROID_CHAIN_ID,
  } as const;

  const { data: totalStaked } = useReadContract({
    ...commonRead,
    abi: ABIS.MatroidGlobalStakingPool,
    functionName: "totalStaked",
    query: { enabled: isPoolReady },
  });

  const { data: staked } = useReadContract({
    ...commonRead,
    abi: ABIS.MatroidGlobalStakingPool,
    functionName: "staked",
    args: address ? [address] : undefined,
    query: { enabled: isPoolReady && Boolean(address) },
  });

  const { data: pendingRewards } = useReadContract({
    ...commonRead,
    abi: ABIS.MatroidGlobalStakingPool,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: isPoolReady && Boolean(address) },
  });

  const { data: userRewardPerTokenPaid } = useReadContract({
    ...commonRead,
    abi: ABIS.MatroidGlobalStakingPool,
    functionName: "userRewardPerTokenPaid",
    args: address ? [address] : undefined,
    query: { enabled: isPoolReady && Boolean(address) },
  });

  const { data: rewardPerTokenStored } = useReadContract({
    ...commonRead,
    abi: ABIS.MatroidGlobalStakingPool,
    functionName: "rewardPerTokenStored",
    query: { enabled: isPoolReady },
  });

  const { data: lastUpdateTime } = useReadContract({
    ...commonRead,
    abi: ABIS.MatroidGlobalStakingPool,
    functionName: "lastUpdateTime",
    query: { enabled: isPoolReady },
  });

  const { data: rewardRate } = useReadContract({
    ...commonRead,
    abi: ABIS.MatroidGlobalStakingPool,
    functionName: "rewardRate",
    query: { enabled: isPoolReady },
  });

  const { data: periodFinish } = useReadContract({
    ...commonRead,
    abi: ABIS.MatroidGlobalStakingPool,
    functionName: "periodFinish",
    query: { enabled: isPoolReady },
  });

  const { data: allowance } = useReadContract({
    address: monaAddress as `0x${string}`,
    chainId: MATROID_CHAIN_ID,
    abi: ABIS.ERC20,
    functionName: "allowance",
    args:
      address && isPoolReady
        ? [address, poolAddress as `0x${string}`]
        : undefined,
    query: { enabled: isMonaReady && Boolean(address) && isPoolReady },
  });

  const { data: balance } = useReadContract({
    address: monaAddress as `0x${string}`,
    chainId: MATROID_CHAIN_ID,
    abi: ABIS.ERC20,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isMonaReady && Boolean(address) },
  });

  const earnedRewards = useMemo(() => {
    if (
      !totalStaked ||
      !rewardPerTokenStored ||
      !lastUpdateTime ||
      !rewardRate ||
      !periodFinish ||
      !userRewardPerTokenPaid ||
      pendingRewards === undefined ||
      !staked
    ) {
      return null;
    }
    const now = toNow();
    const nextRewardPerToken = rewardPerToken(
      totalStaked as bigint,
      rewardPerTokenStored as bigint,
      lastUpdateTime as bigint,
      rewardRate as bigint,
      periodFinish as bigint,
      now,
    );
    return earned(
      staked as bigint,
      pendingRewards as bigint,
      nextRewardPerToken,
      userRewardPerTokenPaid as bigint,
    );
  }, [
    totalStaked,
    rewardPerTokenStored,
    lastUpdateTime,
    rewardRate,
    periodFinish,
    userRewardPerTokenPaid,
    pendingRewards,
    staked,
  ]);

  const ensureChain = async () => {
    if (!switchChain) return;
    await switchChain({ chainId: MATROID_CHAIN_ID });
  };

  const approve = async (amount: string) => {
    if (!address || !isMonaReady || !isPoolReady) return;
    await ensureChain();
    await writeContractAsync({
      address: monaAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.ERC20,
      functionName: "approve",
      args: [poolAddress as `0x${string}`, parseUnits(amount, 18)],
    });
  };

  const stake = async (amount: string) => {
    if (!address || !isPoolReady) return;
    await ensureChain();
    await writeContractAsync({
      address: poolAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.MatroidGlobalStakingPool,
      functionName: "stake",
      args: [parseUnits(amount, 18)],
    });
  };

  const unstake = async (amount: string) => {
    if (!address || !isPoolReady) return;
    await ensureChain();
    await writeContractAsync({
      address: poolAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.MatroidGlobalStakingPool,
      functionName: "unstake",
      args: [parseUnits(amount, 18)],
    });
  };

  const claim = async () => {
    if (!address || !isPoolReady) return;
    await ensureChain();
    await writeContractAsync({
      address: poolAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.MatroidGlobalStakingPool,
      functionName: "claim",
    });
  };

  return {
    poolAddress,
    monaAddress,
    totalStaked: totalStaked as bigint | undefined,
    staked: staked as bigint | undefined,
    pendingRewards: pendingRewards as bigint | undefined,
    earnedRewards,
    allowance: allowance as bigint | undefined,
    balance: balance as bigint | undefined,
    approve,
    stake,
    unstake,
    claim,
    isWriting,
  };
};

export const useMatroidProjectPoolStaking = ({
  poolAddress,
  rewardTokens,
  kind,
}: {
  poolAddress?: string;
  rewardTokens?: string[] | null;
  kind: "erc20" | "nft";
}) => {
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const monaAddress = MATROID_ADDRESSES.mona;
  const isPoolReady =
    Boolean(poolAddress) && isAddress(poolAddress as string);
  const isMonaReady = isAddress(monaAddress);

  const poolCommonRead = {
    address: poolAddress as `0x${string}`,
    chainId: MATROID_CHAIN_ID,
  } as const;

  const { data: totalStaked } = useReadContract({
    ...poolCommonRead,
    abi:
      kind === "erc20"
        ? ABIS.MatroidProjectStakingPool
        : ABIS.MatroidProjectNFTStakingPool,
    functionName: kind === "erc20" ? "totalStaked" : "totalWeight",
    query: { enabled: isPoolReady },
  });

  const { data: userStaked } = useReadContract({
    ...poolCommonRead,
    abi:
      kind === "erc20"
        ? ABIS.MatroidProjectStakingPool
        : ABIS.MatroidProjectNFTStakingPool,
    functionName: kind === "erc20" ? "staked" : "stakedWeight",
    args: address ? [address] : undefined,
    query: { enabled: isPoolReady && Boolean(address) },
  });

  const { data: allowance } = useReadContract({
    address: monaAddress as `0x${string}`,
    chainId: MATROID_CHAIN_ID,
    abi: ABIS.ERC20,
    functionName: "allowance",
    args:
      address && isPoolReady
        ? [address, poolAddress as `0x${string}`]
        : undefined,
    query: { enabled: isMonaReady && Boolean(address) && isPoolReady },
  });

  const { data: balance } = useReadContract({
    address: monaAddress as `0x${string}`,
    chainId: MATROID_CHAIN_ID,
    abi: ABIS.ERC20,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isMonaReady && Boolean(address) },
  });

  const rewardCalls = useMemo<
    readonly {
      address: `0x${string}`;
      chainId: number;
      abi: Abi;
      functionName: string;
      args: readonly `0x${string}`[];
    }[]
  >(() => {
    const tokens = rewardTokens?.filter(Boolean) as string[] | undefined;
    if (!address || !tokens?.length || !isPoolReady) return [];
    return tokens.flatMap((token) => [
      {
        address: poolAddress as `0x${string}`,
        chainId: MATROID_CHAIN_ID,
        abi:
          (kind === "erc20"
            ? ABIS.MatroidProjectStakingPool
            : ABIS.MatroidProjectNFTStakingPool) as Abi,
        functionName: "rewardInfo",
        args: [token as `0x${string}`],
      },
      {
        address: poolAddress as `0x${string}`,
        chainId: MATROID_CHAIN_ID,
        abi:
          (kind === "erc20"
            ? ABIS.MatroidProjectStakingPool
            : ABIS.MatroidProjectNFTStakingPool) as Abi,
        functionName: "pendingRewards",
        args: [address, token as `0x${string}`],
      },
      {
        address: poolAddress as `0x${string}`,
        chainId: MATROID_CHAIN_ID,
        abi:
          (kind === "erc20"
            ? ABIS.MatroidProjectStakingPool
            : ABIS.MatroidProjectNFTStakingPool) as Abi,
        functionName: "rewardDebt",
        args: [address, token as `0x${string}`],
      },
    ]);
  }, [address, rewardTokens, poolAddress, isPoolReady, kind]);

  const rewardReads = useReadContracts({
    contracts: rewardCalls,
    query: { enabled: rewardCalls.length > 0 },
  });

  const rewards = useMemo(() => {
    const tokens = rewardTokens?.filter(Boolean) as string[] | undefined;
    if (!tokens?.length || !rewardReads.data?.length) return null;
    if (!totalStaked || !userStaked) return null;

    const now = toNow();
    const result: Record<string, bigint> = {};
    for (let i = 0; i < tokens.length; i++) {
      const baseIndex = i * 3;
      const rewardInfo = rewardReads.data?.[baseIndex]?.result as
        | {
            enabled: boolean;
            rewardRate: bigint;
            lastUpdateTime: bigint;
            periodFinish: bigint;
            rewardPerTokenStored: bigint;
            queuedRewards: bigint;
          }
        | undefined;
      const pending = rewardReads.data?.[baseIndex + 1]?.result as
        | bigint
        | undefined;
      const debt = rewardReads.data?.[baseIndex + 2]?.result as
        | bigint
        | undefined;

      if (!rewardInfo || pending === undefined || debt === undefined) continue;
      const nextRewardPerToken = rewardPerToken(
        totalStaked as bigint,
        rewardInfo.rewardPerTokenStored,
        rewardInfo.lastUpdateTime,
        rewardInfo.rewardRate,
        rewardInfo.periodFinish,
        now,
      );
      result[tokens[i]] = earned(
        userStaked as bigint,
        pending,
        nextRewardPerToken,
        debt,
      );
    }
    return result;
  }, [rewardReads.data, rewardTokens, totalStaked, userStaked]);

  const ensureChain = async () => {
    if (!switchChain) return;
    await switchChain({ chainId: MATROID_CHAIN_ID });
  };

  const approve = async (amount: string) => {
    if (!address || !isMonaReady || !isPoolReady) return;
    await ensureChain();
    await writeContractAsync({
      address: monaAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.ERC20,
      functionName: "approve",
      args: [poolAddress as `0x${string}`, parseUnits(amount, 18)],
    });
  };

  const stake = async (amount: string) => {
    if (!address || !isPoolReady || kind !== "erc20") return;
    await ensureChain();
    await writeContractAsync({
      address: poolAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.MatroidProjectStakingPool,
      functionName: "stake",
      args: [parseUnits(amount, 18)],
    });
  };

  const unstake = async (amount: string) => {
    if (!address || !isPoolReady || kind !== "erc20") return;
    await ensureChain();
    await writeContractAsync({
      address: poolAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.MatroidProjectStakingPool,
      functionName: "unstake",
      args: [parseUnits(amount, 18)],
    });
  };

  const claim = async (token: string) => {
    if (!address || !isPoolReady) return;
    await ensureChain();
    await writeContractAsync({
      address: poolAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi:
        kind === "erc20"
          ? ABIS.MatroidProjectStakingPool
          : ABIS.MatroidProjectNFTStakingPool,
      functionName: "claim",
      args: [token as `0x${string}`],
    });
  };

  const approveNft = async (nft: string) => {
    if (!address || !isPoolReady || kind !== "nft") return;
    await ensureChain();
    await writeContractAsync({
      address: nft as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.ERC721,
      functionName: "setApprovalForAll",
      args: [poolAddress as `0x${string}`, true],
    });
  };

  const stakeNft = async (nft: string, tokenId: string) => {
    if (!address || !isPoolReady || kind !== "nft") return;
    await ensureChain();
    await writeContractAsync({
      address: poolAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.MatroidProjectNFTStakingPool,
      functionName: "stakeNFT",
      args: [nft as `0x${string}`, BigInt(tokenId)],
    });
  };

  const unstakeNft = async (nft: string, tokenId: string) => {
    if (!address || !isPoolReady || kind !== "nft") return;
    await ensureChain();
    await writeContractAsync({
      address: poolAddress as `0x${string}`,
      chainId: MATROID_CHAIN_ID,
      abi: ABIS.MatroidProjectNFTStakingPool,
      functionName: "unstakeNFT",
      args: [nft as `0x${string}`, BigInt(tokenId)],
    });
  };

  return {
    totalStaked: totalStaked as bigint | undefined,
    userStaked: userStaked as bigint | undefined,
    allowance: allowance as bigint | undefined,
    balance: balance as bigint | undefined,
    rewards,
    approve,
    stake,
    unstake,
    claim,
    approveNft,
    stakeNft,
    unstakeNft,
    isWriting,
  };
};
