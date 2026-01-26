"use client";

import {
  INFURA_GATEWAY,
  PRESETS,
  TOPICS,
  MATROID_CHAIN_ID,
} from "@/app/lib/constants";
import Image from "next/image";
import { FunctionComponent, JSX, useMemo, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { formatUnits } from "viem";
import usePoolSearch from "../hooks/usePoolSearch";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { AiOutlineLoading } from "react-icons/ai";
import {
  useMatroidProjectPools,
  useMatroidErc20Stakers,
  useMatroidNftStakers,
} from "../hooks/useMatroidSubgraph";
import { useMatroidProjectPoolStaking } from "../hooks/useMatroidStaking";
import PoolActionButton from "./ui/PoolActionButton";
import {
  MatroidProjectPoolERC20,
  MatroidProjectPoolNFT,
} from "@/app/lib/queries/matroid";

const SliderSearch: FunctionComponent<{
  dict: any;
  onSearchChange: (value: string) => void;
  search: string;
}> = ({ dict, onSearchChange, search }): JSX.Element => {
  return (
    <div
      id="sliderSearch"
      className="relative w-11/12 h-fit grid grid-flow-row auto-rows-auto"
    >
      <div className="relative w-full h-fit row-start-1">
        <div
          className={`relative w-10/12 h-16 col-start-1 row-start-1 grid grid-flow-col auto-cols-auto rounded-lg border-2 border-black opacity-90 gap-1 pl-1 bg-bluey/50`}
        >
          <div className="relative grid grid-flow-col auto-cols-auto w-fit h-full justify-self-start self-center gap-2 col-span-1">
            <div className="relative col-start-1 w-6 h-6 place-self-center place-self-center grid grid-flow-col auto-cols-auto pl-2">
              <Image
                src={`${INFURA_GATEWAY}/ipfs/QmZhr4Eo92GHQ3Qn3xpv8HSz7ArcjgSPsD3Upe9v8H5rge`}
                alt="search"
                width={15}
                height={20}
                className={`flex w-fit h-fit relative col-start-1 place-self-center`}
                draggable={false}
              />
            </div>
            <div
              className={`relative col-start-2 w-1 h-5/6 self-center justify-self-start border border-black rounded-lg`}
            ></div>
          </div>

          <div className="relative w-full h-full grid grid-flow-row auto-rows-auto col-start-2 col-span-12">
            <input
              className={`relative row-start-1 w-full h-full font-dosis text-black rounded-lg bg-transparent placeholder:text-black`}
              name="search"
              placeholder={dict?.searchPlaceholder}
              autoComplete="off"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const formatAmount = (value?: bigint, decimals = 18) => {
  if (!value) return "0";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const trimmed = fraction.slice(0, 4);
  return trimmed ? `${whole}.${trimmed}` : whole;
};

const ProjectPoolCard = ({
  pool,
  dict,
}: {
  pool:
    | (MatroidProjectPoolERC20 & { kind: "erc20" })
    | (MatroidProjectPoolNFT & { kind: "nft" });
  dict: any;
}) => {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isWrongChain = isConnected && chainId !== MATROID_CHAIN_ID;
  const [amount, setAmount] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [selectedRewardToken, setSelectedRewardToken] = useState(
    pool.rewardTokens?.length ? pool.rewardTokens[0] : "",
  );
  const [selectedNft, setSelectedNft] = useState(
    pool.kind === "nft" && pool.whitelistedNfts?.length
      ? pool.whitelistedNfts[0].nft
      : "",
  );

  const {
    rewards,
    userStaked,
    approve,
    stake,
    unstake,
    claim,
    approveNft,
    stakeNft,
    unstakeNft,
    isWriting,
  } = useMatroidProjectPoolStaking({
    poolAddress: pool.id,
    rewardTokens: pool.rewardTokens,
    kind: pool.kind,
  });

  const rewardEntries = rewards ? Object.entries(rewards) : [];
  const canSubmit = Boolean(amount) && Number(amount) > 0;

  const handleSwitch = async () => {
    if (!switchChain) return;
    await switchChain({ chainId: MATROID_CHAIN_ID });
  };

  return (
    <div className="relative min-w-66 h-fit flex flex-col rounded-2xl border border-black/10 bg-white/70 p-3 gap-3">
      <div className="relative w-full h-fit flex flex-col gap-1">
        <div className="text-offBlack font-dosis text-base">
          {pool.project?.metadata?.title || pool.project?.id}
        </div>
        <div className="text-offBlack/70 text-xs break-all">{pool.id}</div>
      </div>
      <div className="relative w-full h-fit text-xs text-offBlack/80 flex flex-col gap-1">
        <div className="flex flex-row justify-between">
          <span>{dict?.poolType}</span>
          <span>{pool.kind === "erc20" ? "ERC20" : "NFT"}</span>
        </div>
        <div className="flex flex-row justify-between">
          <span>{dict?.totalStaked}</span>
          <span>
            {pool.kind === "erc20"
              ? formatAmount(pool.totalStaked ? BigInt(pool.totalStaked) : 0n)
              : formatAmount(pool.totalWeight ? BigInt(pool.totalWeight) : 0n)}
          </span>
        </div>
        <div className="flex flex-row justify-between">
          <span>{dict?.yourStake}</span>
          <span>{formatAmount(userStaked)} </span>
        </div>
      </div>
      {rewardEntries.length > 0 && (
        <div className="relative w-full h-fit text-xs text-offBlack/80 flex flex-col gap-1">
          {rewardEntries.map(([token, value]) => (
            <div key={token} className="flex flex-row justify-between">
              <span>{dict?.reward}</span>
              <span className="break-all">
                {formatAmount(value)} ({token})
              </span>
            </div>
          ))}
        </div>
      )}
      {pool.rewardTokens?.length ? (
        <select
          value={selectedRewardToken}
          onChange={(e) => setSelectedRewardToken(e.target.value)}
          className="relative w-full h-9 rounded-md border border-black px-3 text-black bg-white"
        >
          {pool.rewardTokens.map((token) => (
            <option key={token} value={token}>
              {token}
            </option>
          ))}
        </select>
      ) : null}
      {pool.kind === "erc20" ? (
        <div className="relative w-full h-fit flex flex-col gap-2">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={dict?.amount}
            className="relative w-full h-9 rounded-md border border-black px-3 text-black bg-white"
          />
          {isWrongChain ? (
            <PoolActionButton
              label={isSwitching ? dict?.switching : dict?.switchToLens}
              onClick={handleSwitch}
              disabled={!switchChain || isSwitching}
              size="sm"
            />
          ) : (
            <div className="relative w-full h-fit flex flex-row flex-wrap gap-2">
              <PoolActionButton
                label={dict?.approve}
                onClick={() => approve(amount)}
                disabled={!canSubmit || isWriting}
                size="sm"
              />
              <PoolActionButton
                label={dict?.stake}
                onClick={() => stake(amount)}
                disabled={!canSubmit || isWriting}
                size="sm"
              />
              <PoolActionButton
                label={dict?.unstake}
                onClick={() => unstake(amount)}
                disabled={!canSubmit || isWriting}
                size="sm"
              />
              {pool.rewardTokens?.[0] && (
                <PoolActionButton
                  label={dict?.claim}
                  onClick={() =>
                    selectedRewardToken && claim(selectedRewardToken)
                  }
                  disabled={isWriting || !selectedRewardToken}
                  size="sm"
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-fit flex flex-col gap-2">
          <select
            value={selectedNft}
            onChange={(e) => setSelectedNft(e.target.value)}
            className="relative w-full h-9 rounded-md border border-black px-3 text-black bg-white"
          >
            {pool.whitelistedNfts?.map((nft) => (
              <option key={nft.id} value={nft.nft}>
                {nft.nft}
              </option>
            ))}
          </select>
          <input
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder={dict?.tokenId}
            className="relative w-full h-9 rounded-md border border-black px-3 text-black bg-white"
          />
          {isWrongChain ? (
            <PoolActionButton
              label={isSwitching ? dict?.switching : dict?.switchToLens}
              onClick={handleSwitch}
              disabled={!switchChain || isSwitching}
              size="sm"
            />
          ) : (
            <div className="relative w-full h-fit flex flex-row flex-wrap gap-2">
              <PoolActionButton
                label={dict?.approve}
                onClick={() => selectedNft && approveNft(selectedNft)}
                disabled={!selectedNft || isWriting}
                size="sm"
              />
              <PoolActionButton
                label={dict?.stake}
                onClick={() =>
                  selectedNft && tokenId && stakeNft(selectedNft, tokenId)
                }
                disabled={!selectedNft || !tokenId || isWriting}
                size="sm"
              />
              <PoolActionButton
                label={dict?.unstake}
                onClick={() =>
                  selectedNft && tokenId && unstakeNft(selectedNft, tokenId)
                }
                disabled={!selectedNft || !tokenId || isWriting}
                size="sm"
              />
              {pool.rewardTokens?.[0] && (
                <PoolActionButton
                  label={dict?.claim}
                  onClick={() =>
                    selectedRewardToken && claim(selectedRewardToken)
                  }
                  disabled={isWriting || !selectedRewardToken}
                  size="sm"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PoolSearch = ({ dict }: { dict: any }) => {
  const { address } = useAccount();
  const { topic: selectedTopic, setTopic, topicValues } = usePoolSearch();
  const [search, setSearch] = useState("");

  const { data: poolsData, isLoading } = useMatroidProjectPools();
  useMatroidErc20Stakers(address);
  useMatroidNftStakers(address);

  const pools = useMemo(() => {
    const erc20Pools =
      poolsData?.projectPoolERC20s?.map((pool) => ({
        ...pool,
        kind: "erc20" as const,
      })) || [];
    const nftPools =
      poolsData?.projectPoolNFTs?.map((pool) => ({
        ...pool,
        kind: "nft" as const,
      })) || [];
    return [...erc20Pools, ...nftPools];
  }, [poolsData]);

  const filteredPools = useMemo(() => {
    if (!search) return pools;
    const term = search.toLowerCase();
    return pools.filter((pool) => {
      const title = pool.project?.metadata?.title?.toLowerCase() || "";
      return (
        title.includes(term) ||
        pool.project?.id.toLowerCase().includes(term) ||
        pool.id.toLowerCase().includes(term)
      );
    });
  }, [pools, search]);

  const showPlaceholders = isLoading || filteredPools.length === 0;

  const topicKeys: { [key: string]: string } = {
    "in the style of": "inTheStyleOf",
    genre: "genre",
    format: "format",
    colors: "colors",
    lighting: "lighting",
    engines: "engines",
    "design tools": "designTools",
    techniques: "techniques",
    fashion: "fashion",
    equipment: "equipment",
    descriptive: "descriptive",
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-shame py-3 pl-3 md:py-10 md:pl-10 gap-10">
      <SliderSearch dict={dict} search={search} onSearchChange={setSearch} />
      <div className="relative w-full h-fit flex flex-col pl-3 md:pl-20 gap-6">
        <div className="relative w-full h-fit flex flex-row gap-5 overflow-x-scroll">
          {TOPICS?.map((topic: string, index: number) => {
            const topicKey = topicKeys[topic];
            return (
              <div
                key={index}
                className="relative cursor-pointer hover:opacity-70 w-fit h-fit flex flex-row gap-1 whitespace-nowrap"
                onClick={() => setTopic(topic)}
              >
                <div className="relative w-fit h-fit capitalize font-dosis text-offBlack text-base self-center">
                  {dict?.topics?.[topicKey]}
                </div>
                <div className="relative w-fit h-fit self-center">
                  {selectedTopic === topic ? (
                    <IoMdArrowDropdown size={25} color="black" />
                  ) : (
                    <IoMdArrowDropright size={25} color="black" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative w-full h-fit flex flex-row gap-7 md:pl-10 overflow-x-scroll pr-3 md:pr-0">
          {topicValues[selectedTopic]?.map((value: string, index: number) => {
            return (
              <div
                key={index}
                className="relative w-fit h-fit whitespace-nowrap"
              >
                <div className="relative w-fit h-fit text-black font-dosis text-sm underline underline-offset-2 cursor-pointer hover:text-offBlue">
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative w-full h-fit flex flex-row gap-3 overflow-x-scroll">
        {showPlaceholders
          ? Array.from(Array(10).keys())?.map((_, index: number) => {
              return (
                <div
                  key={index}
                  id="crt"
                  className="relative min-w-66 h-fit flex flex-col rounded-2xl"
                >
                  <div className="relative w-66 h-96 rounded-t-2xl animate-pulse">
                    <div className="relative w-full h-full flex items-center justify-center animate-spin">
                      <AiOutlineLoading color="black" size={15} />
                    </div>
                  </div>
                  <div className="relative w-full h-80 bg-offBlack rounded-b-2xl flex flex-col text-center text-white font-dosis text-xs p-3">
                    <div className="relative w-full h-fit pb-2 pt-3 px-2">
                      {dict?.pool}: ----
                    </div>
                    <div className="relative w-full h-fit p-2">
                      {dict?.project}: ----
                    </div>
                  </div>
                </div>
              );
            })
          : filteredPools.map((pool) => (
              <ProjectPoolCard key={pool.id} pool={pool} dict={dict} />
            ))}
      </div>
      <div className="relative w-full h-fit flex flex-col gap-5 pt-10 md:pl-20">
        <div className="relative w-fit h-fit text-black font-dosis text-left text-base galaxy:text-lg">
          {dict?.poolSearchPresets}
        </div>
        <div className="relative w-full h-full flex flex-wrap justify-center gap-2 text-center min-h-96 self-center">
          {PRESETS.map((format: string, index: number) => {
            return (
              <span
                key={index}
                className="relative w-fit h-fit inline-flex items-center px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:bg-white text-offBlack/80 lowercase underline underline-offset-2 drop-shadow-md md:whitespace-nowrap text-xs galaxy:text-sm md:text-base bg-white"
              >
                {format}
              </span>
            );
          })}
        </div>
      </div>
      <div className="relative w-full h-fit flex flex-col gap-4 pt-6">
        {showPlaceholders && (
          <div className="relative w-full h-fit text-black font-dosis text-sm">
            {dict?.loading}
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolSearch;
