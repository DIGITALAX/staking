"use client";

import { useMemo, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import Box from "./Box";
import PoolFrame from "./ui/PoolFrame";
import PoolActionButton from "./ui/PoolActionButton";
import { MATROID_CHAIN_ID } from "@/app/lib/constants";
import { useMatroidGlobal } from "../hooks/useMatroidSubgraph";
import { useMatroidGlobalStaking } from "../hooks/useMatroidStaking";

const formatAmount = (value?: bigint, decimals = 18) => {
  if (!value) return "0";
  const [whole, fraction = ""] = formatUnits(value, decimals).split(".");
  const trimmed = fraction.slice(0, 4);
  return trimmed ? `${whole}.${trimmed}` : whole;
};

const Matroid = ({ dict }: { dict: any }) => {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [amount, setAmount] = useState("");

  const { data: globalData } = useMatroidGlobal();
  const {
    totalStaked,
    staked,
    earnedRewards,
    allowance,
    balance,
    approve,
    stake,
    unstake,
    claim,
    isWriting,
  } = useMatroidGlobalStaking();

  const isWrongChain = isConnected && chainId !== MATROID_CHAIN_ID;
  const canSubmit = Boolean(amount) && Number(amount) > 0;
  const needsApproval = useMemo(() => {
    if (!allowance || !amount) return true;
    try {
      const required = parseUnits(amount, 18);
      return allowance < required;
    } catch {
      return true;
    }
  }, [allowance, amount]);

  const handleSwitch = async () => {
    if (!switchChain) return;
    await switchChain({ chainId: MATROID_CHAIN_ID });
  };

  const handleApprove = async () => {
    if (!canSubmit) return;
    await approve(amount);
  };

  const handleStake = async () => {
    if (!canSubmit) return;
    await stake(amount);
  };

  const handleUnstake = async () => {
    if (!canSubmit) return;
    await unstake(amount);
  };

  const handleClaim = async () => {
    await claim();
  };

  return (
    <div className="relative w-full h-full col-start-1 grid grid-flow-row pt-10">
      <div
        className={`relative w-full h-full bg-gradient-to-r from-offBlack via-black/70 to-offBlack rounded-lg flex flex-row pb-10 gap-4 place-self-center row-start-1 pt-4 px-4`}
      >
        <div
          className={`relative w-fit h-full grid-flow-col auto-cols-auto gap-8 grid`}
        >
          <div className="relative row-start-1 place-self-start w-fit h-fit grid grid-flow-row auto-rows-auto gap-6">
            <Box
              image={"QmdBxkJrAmEbn3dFTubcdaRToXnjwnz8ZqHp27p9mz1cDm"}
              col={"1"}
              row={"1"}
              self={"start"}
              justify={"start"}
              border
            />
            <Box
              image={"QmYC8rKZWkZFVtEBJq9mEPVYev5s7ckYkivEKVrobSbxsf"}
              col={"1"}
              row={"2"}
              self={"start"}
              justify={"start"}
              bgColor
              border
            />
          </div>
          <Box
            image={"QmVLBNJAC6MQmB3Z35sd17T9hbrK9zksRk4o7GRdfYiV89"}
            col={"1"}
            row={"2"}
            self={"end"}
            justify={"start"}
            contain
            rounded
          />
        </div>
        <div className="relative w-full h-fit flex flex-col gap-6 place-self-center">
          <div
            className={`relative row-start-1 w-full h-fit grid-flow-col auto-cols-auto self-start justify-between grid`}
          >
            <Box
              image={"QmdiQ9NdH95kSgysocBj7uKbsVjPujPiavozihXRPYt1g5"}
              col={"1"}
              row={"1"}
              self={"center"}
              justify={"start"}
              bgColor
              border
            />
            <Box
              image={"QmTf9xQZfcCX6ThsgwbuxC2cSYDNUiVzD5RKRqoBGkhjbo"}
              col={"2"}
              row={"1"}
              self={"center"}
              justify={"end"}
              bgColor
              border
            />
          </div>
          <PoolFrame title={`*${dict?.lensStaking}*`}>
            <div className="relative w-full h-fit flex flex-col gap-4 font-earl text-sm text-black">
              <div className="relative w-full h-fit flex flex-col gap-2">
                <div className="relative w-full h-fit flex flex-row justify-between">
                  <span>{dict?.totalStaked}</span>
                  <span>{formatAmount(totalStaked)} MONA</span>
                </div>
                <div className="relative w-full h-fit flex flex-row justify-between">
                  <span>{dict?.yourStake}</span>
                  <span>{formatAmount(staked)} MONA</span>
                </div>
                <div className="relative w-full h-fit flex flex-row justify-between">
                  <span>{dict?.yourRewards}</span>
                  <span>{formatAmount(earnedRewards ?? undefined)} MONA</span>
                </div>
                <div className="relative w-full h-fit flex flex-row justify-between">
                  <span>{dict?.walletBalance}</span>
                  <span>{formatAmount(balance)} MONA</span>
                </div>
              </div>
              <div className="relative w-full h-fit flex flex-col gap-3">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={dict?.amount}
                  className="relative w-full h-10 rounded-md border border-black px-3 text-black bg-white"
                />
                {isWrongChain ? (
                  <PoolActionButton
                    label={
                      isSwitching
                        ? dict?.switching
                        : dict?.switchToLens
                    }
                    onClick={handleSwitch}
                    disabled={!switchChain || isSwitching}
                  />
                ) : (
                  <div className="relative w-full h-fit flex flex-row flex-wrap gap-2">
                    <PoolActionButton
                      label={dict?.approve}
                      onClick={handleApprove}
                      disabled={!isConnected || !needsApproval || !canSubmit || isWriting}
                    />
                    <PoolActionButton
                      label={dict?.stake}
                      onClick={handleStake}
                      disabled={!isConnected || needsApproval || !canSubmit || isWriting}
                    />
                    <PoolActionButton
                      label={dict?.unstake}
                      onClick={handleUnstake}
                      disabled={!isConnected || !canSubmit || isWriting}
                    />
                    <PoolActionButton
                      label={dict?.claim}
                      onClick={handleClaim}
                      disabled={!isConnected || isWriting || !earnedRewards || earnedRewards === 0n}
                    />
                  </div>
                )}
              </div>
              <div className="relative w-full h-fit text-xs text-black/80">
                <span>
                  {dict?.matroidGlobalPrefix}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      "https://matroid.digitalax.xyz/",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="relative w-fit h-fit underline underline-offset-2 cursor-pointer text-black hover:text-offBlue text-left"
                >
                  {dict?.linkedHere}
                </button>
                <span>.</span>
              </div>
              <div className="relative w-full h-fit text-xs text-black/70">
                {globalData?.globalPool
                  ? `${dict?.poolAddress}: ${globalData.globalPool}`
                  : ""}
              </div>
            </div>
          </PoolFrame>
        </div>
        <div
          className={`relative w-fit h-full grid grid-flow-col auto-cols-auto gap-8 grid`}
        >
          <Box
            image={"Qme799mCrdfV5F35gbQzfresp8b6MZva8M72ydXoA9APkr"}
            col={"1"}
            row={"1"}
            self={"start"}
            justify={"end"}
            bgColor
            border
          />
          <div className="relative row-start-2 place-self-end w-fit h-fit grid grid-flow-row auto-rows-auto gap-6">
            <Box
              image={"Qmdf4iGgMMrj4gAQy7DDaaDZEKet3DdxQrXwJkXYoSePK7"}
              col={"1"}
              row={"1"}
              self={"end"}
              justify={"end"}
              rounded
              border
            />
            <Box
              image={"QmdBxkJrAmEbn3dFTubcdaRToXnjwnz8ZqHp27p9mz1cDm"}
              col={"1"}
              row={"2"}
              self={"end"}
              justify={"end"}
              border
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matroid;
