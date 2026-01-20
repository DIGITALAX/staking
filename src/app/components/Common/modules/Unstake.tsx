"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { formatUnits } from "viem";
import { MONA_STAKING_ABI, NFT_STAKING_ABI } from "@/app/lib/stakingAbis";
import Image from "next/image";
import { INFURA_GATEWAY, POOLS } from "@/app/lib/constants";
import { getSubgraphEndpoint } from "@/app/lib/subgraph";
import {
  useSubgraphPool,
  useSubgraphStatus,
  useSubgraphStaker,
} from "../hooks/useSubgraph";
import PoolFrame from "./ui/PoolFrame";
import PoolActionButton from "./ui/PoolActionButton";
import { PoolConfig } from "../types/common.types";

const formatAmount = (value?: bigint, decimals = 18) => {
  if (!value) return "0";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const trimmed = fraction.slice(0, 4);
  return trimmed ? `${whole}.${trimmed}` : whole;
};

const PoolCard = ({ pool, dict }: { pool: PoolConfig; dict: any }) => {
  const subgraphEndpoint = getSubgraphEndpoint(pool.subgraphKey);
  const { hasEndpoint } = useSubgraphStatus(subgraphEndpoint);
  const { address, isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const [txError, setTxError] = useState<string | null>(null);

  const isWrongChain = isConnected && chainId !== pool.chainId;
  const isReady = Boolean(address) && !isWrongChain;
  const poolId = pool.stakingAddress.toLowerCase();
  const stakerId = address ? `${poolId}:${address.toLowerCase()}` : undefined;
  const enableSubgraph = hasEndpoint;

  const { data: poolData, isLoading: isPoolLoading } = useSubgraphPool(
    enableSubgraph ? subgraphEndpoint : undefined,
    enableSubgraph ? poolId : undefined,
  );
  const { data: stakerData, isLoading: isStakerLoading } = useSubgraphStaker(
    enableSubgraph ? subgraphEndpoint : undefined,
    enableSubgraph ? stakerId : undefined,
  );

  const commonRead = {
    address: pool.stakingAddress,
    chainId: pool.chainId,
  } as const;

  const { data: tokensClaimable } = useReadContract({
    ...commonRead,
    abi: pool.kind === "mona" ? MONA_STAKING_ABI : NFT_STAKING_ABI,
    functionName: "tokensClaimable",
    query: { enabled: Boolean(address) },
  });

  const { data: stakedBalance } = useReadContract({
    ...commonRead,
    abi: MONA_STAKING_ABI,
    functionName: "getStakedBalance",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && pool.kind === "mona" },
  });

  const { data: stakedLpBalance } = useReadContract({
    ...commonRead,
    abi: MONA_STAKING_ABI,
    functionName: "getStakedLPBalance",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && pool.kind === "mona" },
  });

  const { data: monaUnclaimed } = useReadContract({
    ...commonRead,
    abi: MONA_STAKING_ABI,
    functionName: "unclaimedRewards",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && pool.kind === "mona" },
  });

  const { data: stakedTokens } = useReadContract({
    ...commonRead,
    abi: NFT_STAKING_ABI,
    functionName: "getStakedTokens",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && pool.kind === "nft" },
  });

  const { data: nftUnclaimed } = useReadContract({
    ...commonRead,
    abi: NFT_STAKING_ABI,
    functionName: "unclaimedRewards",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) && pool.kind === "nft" },
  });

  const claimableMona = useMemo(() => {
    if (!monaUnclaimed || !Array.isArray(monaUnclaimed)) return 0n;
    return monaUnclaimed[0] ?? 0n;
  }, [monaUnclaimed]);

  const tokenIds = useMemo(() => {
    if (!stakedTokens || !Array.isArray(stakedTokens)) return [];
    return stakedTokens as bigint[];
  }, [stakedTokens]);

  useEffect(() => {
    setTxError(null);
  }, [pool.id, address, chainId]);

  const canClaimMona =
    Boolean(tokensClaimable) && claimableMona && claimableMona > 0n;
  const canClaimNft =
    Boolean(tokensClaimable) &&
    nftUnclaimed !== undefined &&
    nftUnclaimed !== null &&
    (nftUnclaimed as bigint) > 0n;

  const handleSwitch = async () => {
    if (!switchChain) return;
    setTxError(null);
    try {
      await switchChain({ chainId: pool.chainId });
    } catch (error) {
      setTxError(dict?.switchFailed);
    }
  };

  const handleClaim = async () => {
    if (!address) return;
    setTxError(null);
    try {
      if (pool.kind === "mona") {
        await writeContractAsync({
          address: pool.stakingAddress,
          chainId: pool.chainId,
          abi: MONA_STAKING_ABI,
          functionName: "claimReward",
        });
        return;
      }
      await writeContractAsync({
        address: pool.stakingAddress,
        chainId: pool.chainId,
        abi: NFT_STAKING_ABI,
        functionName: "claimReward",
        args: [address],
      });
    } catch (error) {
      setTxError(dict?.claimFailed);
    }
  };

  const handleUnstakeMona = async (amount?: bigint) => {
    if (!amount || amount === 0n) return;
    setTxError(null);
    try {
      await writeContractAsync({
        address: pool.stakingAddress,
        chainId: pool.chainId,
        abi: MONA_STAKING_ABI,
        functionName: "unstake",
        args: [amount],
      });
    } catch (error) {
      setTxError(dict?.unstakeFailed);
    }
  };

  const handleUnstakeLP = async (amount?: bigint) => {
    if (!amount || amount === 0n) return;
    setTxError(null);
    try {
      await writeContractAsync({
        address: pool.stakingAddress,
        chainId: pool.chainId,
        abi: MONA_STAKING_ABI,
        functionName: "unstakeLP",
        args: [amount],
      });
    } catch (error) {
      setTxError(dict?.unstakeFailed);
    }
  };

  const handleUnstakeToken = async (tokenId: bigint) => {
    setTxError(null);
    try {
      await writeContractAsync({
        address: pool.stakingAddress,
        chainId: pool.chainId,
        abi: NFT_STAKING_ABI,
        functionName: "unstake",
        args: [tokenId],
      });
    } catch (error) {
      setTxError(dict?.unstakeFailed);
    }
  };

  const handleUnstakeAll = async () => {
    if (!tokenIds.length) return;
    setTxError(null);
    try {
      await writeContractAsync({
        address: pool.stakingAddress,
        chainId: pool.chainId,
        abi: NFT_STAKING_ABI,
        functionName: "unstakeBatch",
        args: [tokenIds],
      });
    } catch (error) {
      setTxError(dict?.unstakeAllFailed);
    }
  };

  return (
    <PoolFrame title={`*${dict?.pools?.[pool.nameKey]?.name || pool.name}*`}>
      <div className="flex relative w-full h-fit flex-col gap-4">
        <div className="font-dosis text-sm text-black/70">
          {dict?.pools?.[pool.nameKey]?.description || pool.description}
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-dosis">
          <div className="px-2 py-1 rounded-full border border-black bg-white/80">
            {pool.chainLabel}
          </div>
          <div className="px-2 py-1 rounded-full border border-black bg-white/80">
            {dict?.rewards} {pool.rewardLabel}
          </div>
          <div className="px-2 py-1 rounded-full border border-black bg-white/80">
            {pool.subgraphKey === "eth" ? dict?.unstakeEth : dict?.unstakePoly}
          </div>
        </div>
        {enableSubgraph && (
          <div className="flex flex-wrap gap-3 text-xs font-dosis text-black/70">
            <div>
              {dict?.poolStakers}{" "}
              {isPoolLoading ? "..." : (poolData?.pool?.stakersCount ?? "--")}
            </div>
            <div>
              {dict?.poolClaims}{" "}
              {isPoolLoading
                ? "..."
                : poolData?.pool?.totalClaims
                  ? formatAmount(BigInt(poolData.pool.totalClaims))
                  : "--"}
            </div>
            <div>
              {dict?.yourClaimed}{" "}
              {isStakerLoading
                ? "..."
                : stakerData?.staker?.rewardsClaimed
                  ? formatAmount(BigInt(stakerData.staker.rewardsClaimed))
                  : "--"}
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="font-dosis text-sm text-black/70">
            {dict?.connectWalletPosition}
          </div>
        )}

        {isConnected && isWrongChain && (
          <PoolActionButton
            label={`${dict?.switchTo} ${pool.chainLabel}`}
            onClick={handleSwitch}
            disabled={isSwitching}
          />
        )}

        {isReady && pool.kind === "mona" && (
          <div className="flex flex-col gap-3">
            <div className="font-dosis text-sm">
              {dict?.stakedMona} {formatAmount(stakedBalance as bigint)}
            </div>
            <div className="font-dosis text-sm">
              {dict?.stakedLp} {formatAmount(stakedLpBalance as bigint)}
            </div>
            <div className="font-dosis text-sm">
              {dict?.claimable} {formatAmount(claimableMona)} MONA
            </div>
            <div className="flex flex-wrap gap-2">
              <PoolActionButton
                label={dict?.unstakeAllMona}
                onClick={() => handleUnstakeMona(stakedBalance as bigint)}
                disabled={isWriting || !stakedBalance || stakedBalance === 0n}
              />
              <PoolActionButton
                label={dict?.unstakeAllLp}
                onClick={() => handleUnstakeLP(stakedLpBalance as bigint)}
                disabled={
                  isWriting || !stakedLpBalance || stakedLpBalance === 0n
                }
              />
              <PoolActionButton
                label={dict?.claimRewards}
                onClick={handleClaim}
                disabled={isWriting || !canClaimMona}
              />
            </div>
          </div>
        )}

        {isReady && pool.kind === "nft" && (
          <div className="flex flex-col gap-3">
            <div className="font-dosis text-sm">
              {dict?.stakedNfts} {tokenIds.length}
            </div>
            <div className="font-dosis text-sm">
              {dict?.claimable} {formatAmount(nftUnclaimed as bigint)}{" "}
              {pool.rewardLabel}
            </div>
            <div className="flex flex-wrap gap-2">
              <PoolActionButton
                label={dict?.unstakeAllNfts}
                onClick={handleUnstakeAll}
                disabled={isWriting || tokenIds.length === 0}
              />
              <PoolActionButton
                label={dict?.claimRewards}
                onClick={handleClaim}
                disabled={isWriting || !canClaimNft}
              />
            </div>
            {tokenIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tokenIds.map((tokenId) => (
                  <PoolActionButton
                    key={tokenId.toString()}
                    label={`${dict?.unstakeHash}${tokenId.toString()}`}
                    onClick={() => handleUnstakeToken(tokenId)}
                    disabled={isWriting}
                    size="sm"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {txError && (
          <div className="font-dosis text-xs text-red-600">{txError}</div>
        )}
      </div>
    </PoolFrame>
  );
};

const Unstake = ({ dict }: { dict: any }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [radius, setRadius] = useState(250);
  const selectedPool = POOLS[selectedIndex];

  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth < 640) {
        setRadius(130);
      } else if (window.innerWidth < 768) {
        setRadius(180);
      } else {
        setRadius(250);
      }
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  const handleDialClick = () => {
    setSelectedIndex((prev) => (prev + 1) % POOLS.length);
  };

  return (
    <div className="flex flex-col w-full h-fit gap-6">
      <div className="font-dosis text-base text-black/70 max-w-md">
        {dict?.deLoomDescription}
      </div>
      <div className="flex flex-col gap-6">
        <div className="relative w-full flex flex-col items-center gap-4">
          <div className="relative w-full flex items-center justify-center">
            <div className="relative w-[18rem] h-[18rem] sm:w-[25rem] sm:h-[25rem] md:w-[35rem] md:h-[35rem]">
              {POOLS.map((pool, index) => {
                const angle = (index / POOLS.length) * 360 - 90;
                const isActive = index === selectedIndex;
                return (
                  <button
                    key={pool.id}
                    className={`absolute left-1/2 top-1/2 w-20 sm:w-24 md:w-28 lg:w-32 h-6 sm:h-6 md:h-7 px-1 sm:px-1.5 md:px-2 rounded-full border text-[0.5rem] sm:text-[0.55rem] md:text-[0.6rem] uppercase tracking-[0.12em] sm:tracking-[0.14em] md:tracking-[0.16em] font-digiB transition whitespace-nowrap overflow-hidden text-ellipsis text-center cursor-pointer ${
                      isActive
                        ? "bg-offBlack text-white border-offBlack"
                        : "bg-offWhite border-black/40 text-black/80 hover:bg-white"
                    }`}
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
                    }}
                    onClick={() => setSelectedIndex(index)}
                  >
                    {dict?.pools?.[pool.nameKey]?.shortName ||
                      pool.shortName ||
                      dict?.pools?.[pool.nameKey]?.name ||
                      pool.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleDialClick}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer w-40 h-40 sm:w-56 sm:h-56 md:w-80 md:h-80"
                aria-label="Rotate pools"
              >
                <div className="relative w-full h-full flex">
                  <Image
                    src={`${INFURA_GATEWAY}/ipfs/QmQZ8UwjeizDQkbCiZED8Ya4LxpFD5JbVbNeAdowurHkiY`}
                    fill
                    alt="dial"
                    draggable={false}
                    className="hover:rotate-3 active:rotate-6 transition object-contain"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
        <PoolCard dict={dict} pool={selectedPool} />
      </div>
    </div>
  );
};

export default Unstake;
