import { useAccount } from "wagmi";
import {
  useSubgraphPools,
  useSubgraphStakersByAddress,
  useSubgraphToken,
  useSubgraphTokenTransfers,
  useSubgraphTokenHoldersByAddress,
} from "./useSubgraph";
import { useContext, useEffect, useMemo, useState } from "react";
import { createPublicClient, http, type PublicClient } from "viem";
import { MONA, TOKEN_ADDRESSES } from "@/app/lib/constants";
import { MonaStats } from "../types/common.types";
import { chains } from "@lens-chain/sdk/viem";
import { ModalContext } from "@/app/providers";
import { ABIS } from "@/app/abis";

const toBigInt = (value?: string | null) =>
  value ? BigInt(value) : undefined;

const toBigIntOrZero = (value?: string | null) => (value ? BigInt(value) : 0n);

const mapTransfers = (transfers?:
  | {
      txHash: string;
      from: string;
      to: string;
      amount: string;
      blockNumber: string;
    }[]
  | null) =>
  transfers?.map((transfer) => ({
    hash: transfer.txHash ?? "",
    from: transfer.from,
    to: transfer.to,
    value: BigInt(transfer.amount),
    blockNumber: toBigIntOrZero(transfer.blockNumber),
  })) ?? [];

const useStats = () => {
  const { address } = useAccount();
  const context = useContext(ModalContext);
  const normalizedAddress = address?.toLowerCase();

  const ethPoolsQuery = useSubgraphPools("eth");
  const polyPoolsQuery = useSubgraphPools("poly");
  const ethStakersQuery = useSubgraphStakersByAddress("eth", normalizedAddress);
  const polyStakersQuery = useSubgraphStakersByAddress(
    "poly",
    normalizedAddress,
  );

  const ethMonaId = MONA.eth.toLowerCase();
  const polyMonaId = MONA.poly.toLowerCase();
  const genesisV1Id = TOKEN_ADDRESSES.eth.genesisV1.toLowerCase();
  const podeV1Id = TOKEN_ADDRESSES.eth.podeV1.toLowerCase();
  const genesisV2Id = TOKEN_ADDRESSES.poly.genesisV2.toLowerCase();
  const podeV2Id = TOKEN_ADDRESSES.poly.podeV2.toLowerCase();
  const decoId = TOKEN_ADDRESSES.poly.deco.toLowerCase();
  const dltaId = TOKEN_ADDRESSES.poly.dlta.toLowerCase();

  const ethMonaTokenQuery = useSubgraphToken("eth", ethMonaId);
  const polyMonaTokenQuery = useSubgraphToken("poly", polyMonaId);
  const ethMonaTransfersQuery = useSubgraphTokenTransfers(
    "eth",
    ethMonaId,
    10,
  );
  const polyMonaTransfersQuery = useSubgraphTokenTransfers(
    "poly",
    polyMonaId,
    10,
  );

  const ethMonaHolderQuery = useSubgraphTokenHoldersByAddress(
    "eth",
    ethMonaId,
    normalizedAddress,
  );
  const polyMonaHolderQuery = useSubgraphTokenHoldersByAddress(
    "poly",
    polyMonaId,
    normalizedAddress,
  );
  const genesisV1HolderQuery = useSubgraphTokenHoldersByAddress(
    "eth",
    genesisV1Id,
    normalizedAddress,
  );
  const podeV1HolderQuery = useSubgraphTokenHoldersByAddress(
    "eth",
    podeV1Id,
    normalizedAddress,
  );
  const genesisV2HolderQuery = useSubgraphTokenHoldersByAddress(
    "poly",
    genesisV2Id,
    normalizedAddress,
  );
  const podeV2HolderQuery = useSubgraphTokenHoldersByAddress(
    "poly",
    podeV2Id,
    normalizedAddress,
  );
  const decoHolderQuery = useSubgraphTokenHoldersByAddress(
    "poly",
    decoId,
    normalizedAddress,
  );
  const dltaHolderQuery = useSubgraphTokenHoldersByAddress(
    "poly",
    dltaId,
    normalizedAddress,
  );

  const decoTokenQuery = useSubgraphToken("poly", decoId);
  const dltaTokenQuery = useSubgraphToken("poly", dltaId);

  const lensClient = useMemo(
    () =>
      createPublicClient({
        chain: chains.mainnet,
        transport: http("https://rpc.lens.xyz"),
      }),
    [],
  );

  const [walletMonaLens, setWalletMonaLens] = useState<bigint | undefined>();

  useEffect(() => {
    if (!address) {
      setWalletMonaLens(undefined);
      return;
    }

    const loadLensBalance = async (client: PublicClient) => {
      try {
        const balance = (await client.readContract({
          address: MONA.lens as `0x${string}`,
          abi: ABIS.ERC20,
          functionName: "balanceOf",
          args: [address],
        })) as bigint;
        setWalletMonaLens(balance);
      } catch (error) {
        setWalletMonaLens(undefined);
      }
    };

    loadLensBalance(lensClient);
  }, [address, lensClient]);

  const ethMona = useMemo<MonaStats | undefined>(() => {
    const token = ethMonaTokenQuery.data?.token;
    if (!token) return context?.statsCache.ethMona;
    return {
      name: token.name,
      symbol: token.symbol ?? token.name,
      decimals: token.decimals ?? 18,
      totalSupply: toBigInt(token.totalSupply),
      availableToMint: toBigInt(token.availableToMint),
      freezeCap: token.freezeCap ?? undefined,
      cap: toBigInt(token.cap),
      transfers: mapTransfers(ethMonaTransfersQuery.data?.tokenTransfers),
    };
  }, [
    context?.statsCache.ethMona,
    ethMonaTokenQuery.data?.token,
    ethMonaTransfersQuery.data?.tokenTransfers,
  ]);

  const polyMona = useMemo<MonaStats | undefined>(() => {
    const token = polyMonaTokenQuery.data?.token;
    if (!token) return context?.statsCache.polyMona;
    return {
      name: token.name,
      symbol: token.symbol ?? token.name,
      decimals: token.decimals ?? 18,
      totalSupply: toBigInt(token.totalSupply),
      transfers: mapTransfers(polyMonaTransfersQuery.data?.tokenTransfers),
    };
  }, [
    context?.statsCache.polyMona,
    polyMonaTokenQuery.data?.token,
    polyMonaTransfersQuery.data?.tokenTransfers,
  ]);

  const walletMonaEth = useMemo(
    () => toBigInt(ethMonaHolderQuery.data?.tokenHolders?.[0]?.balance),
    [ethMonaHolderQuery.data?.tokenHolders],
  );

  const walletMonaPoly = useMemo(
    () => toBigInt(polyMonaHolderQuery.data?.tokenHolders?.[0]?.balance),
    [polyMonaHolderQuery.data?.tokenHolders],
  );

  const walletGenesisV1 = useMemo(
    () => toBigInt(genesisV1HolderQuery.data?.tokenHolders?.[0]?.balance),
    [genesisV1HolderQuery.data?.tokenHolders],
  );

  const walletGenesisV2 = useMemo(
    () => toBigInt(genesisV2HolderQuery.data?.tokenHolders?.[0]?.balance),
    [genesisV2HolderQuery.data?.tokenHolders],
  );

  const walletPodeV1 = useMemo(
    () => toBigInt(podeV1HolderQuery.data?.tokenHolders?.[0]?.balance),
    [podeV1HolderQuery.data?.tokenHolders],
  );

  const walletPodeV2 = useMemo(
    () => toBigInt(podeV2HolderQuery.data?.tokenHolders?.[0]?.balance),
    [podeV2HolderQuery.data?.tokenHolders],
  );

  const walletDeco = useMemo(
    () => toBigInt(decoHolderQuery.data?.tokenHolders?.[0]?.balance),
    [decoHolderQuery.data?.tokenHolders],
  );

  const walletDlta = useMemo(
    () => toBigInt(dltaHolderQuery.data?.tokenHolders?.[0]?.balance),
    [dltaHolderQuery.data?.tokenHolders],
  );

  const decoDecimals = decoTokenQuery.data?.token?.decimals ?? 18;
  const dltaDecimals = dltaTokenQuery.data?.token?.decimals ?? 18;

  const walletTotals = [
    ...(ethStakersQuery.data?.stakers || []),
    ...(polyStakersQuery.data?.stakers || []),
  ].reduce(
    (acc, staker) => {
      const claimed = staker.rewardsClaimed
        ? BigInt(staker.rewardsClaimed)
        : 0n;
      const staked = staker.stakedCount ? BigInt(staker.stakedCount) : 0n;
      return {
        claimed: acc.claimed + claimed,
        staked: acc.staked + staked,
      };
    },
    { claimed: 0n, staked: 0n },
  );


  return {
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
  };
};

export default useStats;
