"use client";

import PoolFrame from "./ui/PoolFrame";
import Box from "./Box";
import useStats from "../hooks/useStats";
import {
  formatAmount,
  formatAmountWithDecimals,
  shortAddress,
} from "@/app/lib/helpers";

const Stats = ({ dict }: { dict: any }) => {
  const {
    walletDeco,
    walletDlta,
    walletTotals,
    ethMona,
    polyMona,
    walletMonaEth,
    walletMonaPoly,
    walletMonaLens,
    walletGenesisV1,
    walletGenesisV2,
    walletPodeV1,
    walletPodeV2,
    decoDecimals,
    dltaDecimals,
    polyPoolsQuery,
    ethPoolsQuery,
  } = useStats();

  const isAmountPool = (kind?: string | null) =>
    kind === "mona" || kind === "w3f";

  const getStakedTotals = (pools?: typeof ethPoolsQuery.data.pools) => {
    if (!pools?.length) {
      return { amount: 0n, count: 0 };
    }
    return pools.reduce(
      (acc, pool) => {
        if (!pool.totalStaked) return acc;
        if (isAmountPool(pool.kind)) {
          acc.amount += BigInt(pool.totalStaked);
        } else {
          acc.count += Number(pool.totalStaked);
        }
        return acc;
      },
      { amount: 0n, count: 0 },
    );
  };

  const ethStakedTotals = getStakedTotals(ethPoolsQuery.data?.pools);
  const polyStakedTotals = getStakedTotals(polyPoolsQuery.data?.pools);

  return (
    <div className="relative w-full h-full col-start-1 grid grid-flow-row pt-10">
      <div
        className={`relative w-full h-full bg-gradient-to-r from-offBlack via-black/70 to-offBlack rounded-lg flex flex-row pb-10 gap-4 place-self-center row-start-1 pt-4 sm:px-4`}
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
          <div className="flex flex-col w-full h-fit gap-4">
            <div className="flex flex-col gap-6">
              <PoolFrame title={`*${dict?.ethTrace}*`}>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.name}: {ethMona?.name ?? "--"}
                  </div>
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.symbol}: {ethMona?.symbol ?? "--"}
                  </div>
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.decimals}: {ethMona?.decimals ?? "--"}
                  </div>
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.totalSupply}:{" "}
                    {formatAmountWithDecimals(
                      ethMona?.totalSupply,
                      ethMona?.decimals ?? 18,
                    )}
                  </div>
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.availableToMint}:{" "}
                    {formatAmountWithDecimals(
                      ethMona?.availableToMint,
                      ethMona?.decimals ?? 18,
                    )}
                  </div>
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.freezeCap}: {ethMona?.freezeCap ? dict?.yes : dict?.no}
                  </div>
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.cap}:{" "}
                    {formatAmountWithDecimals(
                      ethMona?.cap,
                      ethMona?.decimals ?? 18,
                    )}
                  </div>
                  <div className="font-digiB text-sm mt-2">
                    {dict?.recentTransfers}
                  </div>
                  {ethMona?.transfers?.length ? (
                    <div className="flex flex-col gap-2">
                      {ethMona.transfers.map((transfer) => (
                        <div
                          key={`${transfer.hash}-${transfer.blockNumber}`}
                          className="flex flex-col gap-1 rounded-md border border-black/40 bg-white/80 p-2 text-xs font-dosis text-black/70"
                        >
                          <div>{dict?.tx}: {shortAddress(transfer.hash)}</div>
                          <div>
                            {shortAddress(transfer.from)} →{" "}
                            {shortAddress(transfer.to)}
                          </div>
                          <div>
                            {dict?.amount}:{" "}
                            {formatAmountWithDecimals(
                              transfer.value,
                              ethMona?.decimals ?? 18,
                            )}
                          </div>
                          <div>{dict?.block}: {transfer.blockNumber.toString()}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-dosis text-black/70">
                      {dict?.noTransfers}
                    </div>
                  )}
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.stakers}: {ethPoolsQuery.totals.stakers ?? "--"}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.claims}: {formatAmount(ethPoolsQuery.totals.claims)}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.staked}: {formatAmount(ethStakedTotals.amount)}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.stakedNfts}: {ethStakedTotals.count}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.poolsTitle}: {ethPoolsQuery.data?.pools?.length ?? "--"}
                  </div>
                </div>
              </PoolFrame>
              <PoolFrame title={`*${dict?.polyTrace}*`}>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.name}: {polyMona?.name ?? "--"}
                  </div>
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.symbol}: {polyMona?.symbol ?? "--"}
                  </div>
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.decimals}: {polyMona?.decimals ?? "--"}
                  </div>
                  <div className="text-xs font-dosis text-black/70">
                    {dict?.totalSupply}:{" "}
                    {formatAmountWithDecimals(
                      polyMona?.totalSupply,
                      polyMona?.decimals ?? 18,
                    )}
                  </div>
                  <div className="font-digiB text-sm mt-2">
                    {dict?.recentTransfers}
                  </div>
                  {polyMona?.transfers?.length ? (
                    <div className="flex flex-col gap-2">
                      {polyMona.transfers.map((transfer) => (
                        <div
                          key={`${transfer.hash}-${transfer.blockNumber}`}
                          className="flex flex-col gap-1 rounded-md border border-black/40 bg-white/80 p-2 text-xs font-dosis text-black/70"
                        >
                          <div>{dict?.tx}: {shortAddress(transfer.hash)}</div>
                          <div>
                            {shortAddress(transfer.from)} →{" "}
                            {shortAddress(transfer.to)}
                          </div>
                          <div>
                            {dict?.amount}:{" "}
                            {formatAmountWithDecimals(
                              transfer.value,
                              polyMona?.decimals ?? 18,
                            )}
                          </div>
                          <div>{dict?.block}: {transfer.blockNumber.toString()}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs font-dosis text-black/70">
                      {dict?.noTransfers}
                    </div>
                  )}
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.stakers}: {polyPoolsQuery.totals.stakers ?? "--"}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.claims}: {formatAmount(polyPoolsQuery.totals.claims)}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.staked}: {formatAmount(polyStakedTotals.amount)}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.stakedNfts}: {polyStakedTotals.count}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.poolsTitle}: {polyPoolsQuery.data?.pools?.length ?? "--"}
                  </div>
                </div>
              </PoolFrame>

              <PoolFrame title={`*${dict?.yourTrace}*`}>
                <div className="flex flex-col gap-2">
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.yourClaimedTotal}
                  </div>
                  <div className="font-digiB text-lg">
                    {walletTotals ? formatAmount(walletTotals.claimed) : "--"}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    {dict?.yourStakedCount}
                  </div>
                  <div className="font-digiB text-lg">
                    {walletTotals ? walletTotals.staked.toString() : "--"}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    MONA (ETH)
                  </div>
                  <div className="font-digiB text-lg">
                    {formatAmountWithDecimals(
                      walletMonaEth,
                      ethMona?.decimals ?? 18,
                    )}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    MONA (POLY)
                  </div>
                  <div className="font-digiB text-lg">
                    {formatAmountWithDecimals(
                      walletMonaPoly,
                      polyMona?.decimals ?? 18,
                    )}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    MONA (LENS)
                  </div>
                  <div className="font-digiB text-lg">
                    {formatAmountWithDecimals(walletMonaLens, 18)}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    Genesis v1 (ETH)
                  </div>
                  <div className="font-digiB text-lg">
                    {walletGenesisV1?.toString() ?? "--"}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    Genesis v2 (POLY)
                  </div>
                  <div className="font-digiB text-lg">
                    {walletGenesisV2?.toString() ?? "--"}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    PODE v1 (ETH)
                  </div>
                  <div className="font-digiB text-lg">
                    {walletPodeV1?.toString() ?? "--"}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    PODE v2 (POLY)
                  </div>
                  <div className="font-digiB text-lg">
                    {walletPodeV2?.toString() ?? "--"}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    DECO (POLY)
                  </div>
                  <div className="font-digiB text-lg">
                    {formatAmountWithDecimals(walletDeco, decoDecimals)}
                  </div>
                  <div className="font-dosis text-xs text-black/60">
                    DLTA (POLY)
                  </div>
                  <div className="font-digiB text-lg">
                    {formatAmountWithDecimals(walletDlta, dltaDecimals)}
                  </div>
                </div>
              </PoolFrame>
            </div>
            {[
              ...(ethPoolsQuery.data?.pools || []),
              ...(polyPoolsQuery.data?.pools || []),
            ].length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="font-digiB text-white text-lg">
                  {dict?.poolsOverview}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    ...(ethPoolsQuery.data?.pools || []),
                    ...(polyPoolsQuery.data?.pools || []),
                  ].map((pool) => (
                    <div
                      key={pool.id}
                      className="flex flex-col gap-1 rounded-lg border-2 border-black bg-white/80 p-3"
                    >
                      <div className="font-digiB text-base">{pool.name}</div>
                      <div className="font-dosis text-xs text-black/60">
                        {dict?.stakers}: {pool.stakersCount ?? "--"}
                      </div>
                      <div className="font-dosis text-xs text-black/60">
                        {dict?.totalClaims}:{" "}
                        {pool.totalClaims
                          ? formatAmount(BigInt(pool.totalClaims))
                          : "--"}
                      </div>
                      <div className="font-dosis text-xs text-black/60">
                        {dict?.totalStaked}:{" "}
                        {pool.totalStaked
                          ? isAmountPool(pool.kind)
                            ? formatAmount(BigInt(pool.totalStaked))
                            : pool.totalStaked
                          : "--"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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

export default Stats;
