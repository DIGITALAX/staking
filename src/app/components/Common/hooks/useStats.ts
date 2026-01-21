import { useAccount } from "wagmi";
import { useSubgraphPools, useSubgraphStakersByAddress } from "./useSubgraph";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createPublicClient,
  http,
  parseAbiItem,
  type PublicClient,
} from "viem";
import { MONA, TOKEN_ADDRESSES } from "@/app/lib/constants";
import { MonaStats, TransferItem } from "../types/common.types";
import { chains } from "@lens-chain/sdk/viem";
import { mainnet, polygon } from "viem/chains";
import { ModalContext } from "@/app/providers";
import { ABIS } from "@/app/abis";

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const createRateLimiter = (minDelayMs: number) => {
  let lastRun = 0;
  let pending: Promise<any> = Promise.resolve();

  return async <T>(fn: () => Promise<T>) => {
    const next = pending.then(async () => {
      const now = Date.now();
      const wait = Math.max(0, minDelayMs - (now - lastRun));
      if (wait) {
        await delay(wait);
      }
      lastRun = Date.now();
      return fn();
    });

    pending = next.catch(() => undefined);
    return next;
  };
};

const useStats = () => {
  const { address } = useAccount();
  const context = useContext(ModalContext);
  const rateLimiterRef = useRef(createRateLimiter(250));
  const statsLoadingRef = useRef(false);
  const ethPoolsQuery = useSubgraphPools("eth");
  const polyPoolsQuery = useSubgraphPools("poly");
  const ethStakersQuery = useSubgraphStakersByAddress(
    "eth",
    address?.toLowerCase(),
  );
  const polyStakersQuery = useSubgraphStakersByAddress(
    "poly",
    address?.toLowerCase(),
  );

  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
  const ethClient = useMemo(
    () =>
      createPublicClient({
        chain: mainnet,
        transport: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`),
      }),
    [alchemyKey],
  );
  const polyClient = useMemo(
    () =>
      createPublicClient({
        chain: polygon,
        transport: http(
          `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`,
        ),
      }),
    [alchemyKey],
  );
  const lensClient = useMemo(
    () =>
      createPublicClient({
        chain: chains.mainnet,
        transport: http("https://rpc.lens.xyz"),
      }),
    [],
  );

  const [ethMona, setEthMona] = useState<MonaStats | undefined>(
    context?.statsCache.ethMona,
  );
  const [polyMona, setPolyMona] = useState<MonaStats | undefined>(
    context?.statsCache.polyMona,
  );
  const [walletMonaEth, setWalletMonaEth] = useState<bigint>();
  const [walletMonaPoly, setWalletMonaPoly] = useState<bigint>();
  const [walletMonaLens, setWalletMonaLens] = useState<bigint>();
  const [walletGenesisV1, setWalletGenesisV1] = useState<bigint>();
  const [walletGenesisV2, setWalletGenesisV2] = useState<bigint>();
  const [walletPodeV1, setWalletPodeV1] = useState<bigint>();
  const [walletPodeV2, setWalletPodeV2] = useState<bigint>();
  const [walletDeco, setWalletDeco] = useState<bigint>();
  const [walletDlta, setWalletDlta] = useState<bigint>();
  const [decoDecimals, setDecoDecimals] = useState<number>(18);
  const [dltaDecimals, setDltaDecimals] = useState<number>(18);
  const [podeV1Address, setPodeV1Address] = useState<string | undefined>(
    context?.statsCache.podeV1Address,
  );

  useEffect(() => {
    const fetchRecentTransfers = async (
      client: PublicClient,
      monaAddress: `0x${string}`,
    ) => {
      try {
        const rateLimit = rateLimiterRef.current;
        const transferEvent = parseAbiItem(
          "event Transfer(address indexed from, address indexed to, uint256 value)",
        );
        const latest = await rateLimit(() => client.getBlockNumber());
        const step = 50_000n;
        const logs: TransferItem[] = [];
        let toBlock = latest;
        let loops = 0;

        while (logs.length < 10 && toBlock > 0n && loops < 8) {
          const fromBlock = toBlock > step ? toBlock - step : 0n;
          const batch = await rateLimit(() =>
            client.getLogs({
              address: monaAddress,
              event: transferEvent,
              fromBlock,
              toBlock,
            }),
          );
          batch.forEach((log) => {
            logs.push({
              hash: log.transactionHash ?? "",
              from: log.args.from!,
              to: log.args.to!,
              value: log.args.value!,
              blockNumber: log.blockNumber ?? 0n,
            });
          });
          if (fromBlock === 0n) break;
          toBlock = fromBlock - 1n;
          loops += 1;
        }

        return logs
          .sort((a, b) => {
            if (a.blockNumber === b.blockNumber) return 0;
            return Number(b.blockNumber - a.blockNumber);
          })
          .slice(0, 10);
      } catch (error) {
        return [];
      }
    };

    const loadMonaStats = async () => {
      const rateLimit = rateLimiterRef.current;
      const monaEthAddress = MONA.eth as `0x${string}`;
      const monaPolyAddress = MONA.poly as `0x${string}`;

      const ethName = (await rateLimit(() =>
        ethClient.readContract({
          address: monaEthAddress,
          abi: ABIS.MONA,
          functionName: "name",
        }),
      )) as string;
      const ethSymbol = (await rateLimit(() =>
        ethClient.readContract({
          address: monaEthAddress,
          abi: ABIS.MONA,
          functionName: "symbol",
        }),
      )) as string;
      const ethDecimals = (await rateLimit(() =>
        ethClient.readContract({
          address: monaEthAddress,
          abi: ABIS.MONA,
          functionName: "decimals",
        }),
      )) as number;
      const ethSupply = (await rateLimit(() =>
        ethClient.readContract({
          address: monaEthAddress,
          abi: ABIS.MONA,
          functionName: "totalSupply",
        }),
      )) as bigint;
      const availableToMint = (await rateLimit(() =>
        ethClient.readContract({
          address: monaEthAddress,
          abi: ABIS.MONA,
          functionName: "availableToMint",
        }),
      )) as bigint;
      const freezeCap = (await rateLimit(() =>
        ethClient.readContract({
          address: monaEthAddress,
          abi: ABIS.MONA,
          functionName: "freezeCap",
        }),
      )) as boolean;
      const cap = (await rateLimit(() =>
        ethClient.readContract({
          address: monaEthAddress,
          abi: ABIS.MONA,
          functionName: "cap",
        }),
      )) as bigint;

      const polyName = (await rateLimit(() =>
        polyClient.readContract({
          address: monaPolyAddress,
          abi: ABIS.ERC20,
          functionName: "name",
        }),
      )) as string;
      const polySymbol = (await rateLimit(() =>
        polyClient.readContract({
          address: monaPolyAddress,
          abi: ABIS.ERC20,
          functionName: "symbol",
        }),
      )) as string;
      const polyDecimals = (await rateLimit(() =>
        polyClient.readContract({
          address: monaPolyAddress,
          abi: ABIS.ERC20,
          functionName: "decimals",
        }),
      )) as number;
      const polySupply = (await rateLimit(() =>
        polyClient.readContract({
          address: monaPolyAddress,
          abi: ABIS.ERC20,
          functionName: "totalSupply",
        }),
      )) as bigint;

      const [ethTransfers, polyTransfers] = await Promise.all([
        fetchRecentTransfers(ethClient, monaEthAddress),
        fetchRecentTransfers(polyClient, monaPolyAddress),
      ]);

      return {
        ethMona: {
          name: ethName,
          symbol: ethSymbol,
          decimals: ethDecimals,
          totalSupply: ethSupply,
          availableToMint,
          freezeCap,
          cap,
          transfers: ethTransfers,
        },
        polyMona: {
          name: polyName,
          symbol: polySymbol,
          decimals: polyDecimals,
          totalSupply: polySupply,
          transfers: polyTransfers,
        },
      };
    };

    const loadCachedStats = () => {
      if (!context?.statsCache.loaded) return false;
      setEthMona(context.statsCache.ethMona);
      setPolyMona(context.statsCache.polyMona);
      if (context.statsCache.podeV1Address) {
        setPodeV1Address(context.statsCache.podeV1Address);
      }
      return true;
    };

    if (loadCachedStats() || statsLoadingRef.current) {
      return;
    }

    statsLoadingRef.current = true;
    let active = true;

    loadMonaStats()
      .then((stats) => {
        if (!active) return;
        setEthMona(stats.ethMona);
        setPolyMona(stats.polyMona);
        context?.setStatsCache((prev) => ({
          ...prev,
          loaded: true,
          ethMona: stats.ethMona,
          polyMona: stats.polyMona,
        }));
      })
      .finally(() => {
        statsLoadingRef.current = false;
      });

    return () => {
      active = false;
    };
  }, [context, ethClient, polyClient]);

  useEffect(() => {
    if (context?.statsCache.podeV1Address) {
      setPodeV1Address(context.statsCache.podeV1Address);
      return;
    }

    const loadPodeV1 = async () => {
      const rateLimit = rateLimiterRef.current;
      const portalAddress = TOKEN_ADDRESSES.eth.podePortal as `0x${string}`;
      const podeNft = (await rateLimit(() =>
        ethClient.readContract({
          address: portalAddress,
          abi: ABIS.Portal,
          functionName: "podeNft",
        }),
      )) as `0x${string}`;
      setPodeV1Address(podeNft);
      context?.setStatsCache((prev) => ({
        ...prev,
        podeV1Address: podeNft,
      }));
    };

    loadPodeV1();
  }, [context, ethClient]);

  useEffect(() => {
    if (!address) {
      setWalletMonaEth(undefined);
      setWalletMonaPoly(undefined);
      setWalletMonaLens(undefined);
      setWalletGenesisV1(undefined);
      setWalletGenesisV2(undefined);
      setWalletPodeV1(undefined);
      setWalletPodeV2(undefined);
      setWalletDeco(undefined);
      setWalletDlta(undefined);
      return;
    }

    const loadWalletBalances = async () => {
      const rateLimit = rateLimiterRef.current;
      const monaEthAddress = MONA.eth as `0x${string}`;
      const monaPolyAddress = MONA.poly as `0x${string}`;
      const monaLensAddress = MONA.lens as `0x${string}`;
      const [ethBalance, polyBalance, lensBalance] = await Promise.all([
        rateLimit(() =>
          ethClient.readContract({
            address: monaEthAddress,
            abi: ABIS.ERC20,
            functionName: "balanceOf",
            args: [address],
          }),
        ),
        rateLimit(() =>
          polyClient.readContract({
            address: monaPolyAddress,
            abi: ABIS.ERC20,
            functionName: "balanceOf",
            args: [address],
          }),
        ),
        rateLimit(() =>
          lensClient.readContract({
            address: monaLensAddress,
            abi: ABIS.ERC20,
            functionName: "balanceOf",
            args: [address],
          }),
        ),
      ]);
      setWalletMonaEth(ethBalance as bigint);
      setWalletMonaPoly(polyBalance as bigint);
      setWalletMonaLens(lensBalance as bigint);

      const genesisV1Address = TOKEN_ADDRESSES.eth.genesisV1 as `0x${string}`;
      const genesisV2Address = TOKEN_ADDRESSES.poly.genesisV2 as `0x${string}`;
      const podeV2Address = TOKEN_ADDRESSES.poly.podeV2 as `0x${string}`;
      const decoAddress = TOKEN_ADDRESSES.poly.deco as `0x${string}`;
      const dltaAddress = TOKEN_ADDRESSES.poly.dlta as `0x${string}`;

      const [
        genesisV1Bal,
        genesisV2Bal,
        podeV2Bal,
        decoBal,
        dltaBal,
        decoDec,
        dltaDec,
      ] = await Promise.all([
        rateLimit(() =>
          ethClient.readContract({
            address: genesisV1Address,
            abi: ABIS.ERC721,
            functionName: "balanceOf",
            args: [address],
          }),
        ),
        rateLimit(() =>
          polyClient.readContract({
            address: genesisV2Address,
            abi: ABIS.ERC721,
            functionName: "balanceOf",
            args: [address],
          }),
        ),
        rateLimit(() =>
          polyClient.readContract({
            address: podeV2Address,
            abi: ABIS.ERC721,
            functionName: "balanceOf",
            args: [address],
          }),
        ),
        rateLimit(() =>
          polyClient.readContract({
            address: decoAddress,
            abi: ABIS.ERC20,
            functionName: "balanceOf",
            args: [address],
          }),
        ),
        rateLimit(() =>
          polyClient.readContract({
            address: dltaAddress,
            abi: ABIS.ERC20,
            functionName: "balanceOf",
            args: [address],
          }),
        ),
        rateLimit(() =>
          polyClient.readContract({
            address: decoAddress,
            abi: ABIS.ERC20,
            functionName: "decimals",
          }),
        ),
        rateLimit(() =>
          polyClient.readContract({
            address: dltaAddress,
            abi: ABIS.ERC20,
            functionName: "decimals",
          }),
        ),
      ]);

      setWalletGenesisV1(genesisV1Bal as bigint);
      setWalletGenesisV2(genesisV2Bal as bigint);
      setWalletPodeV2(podeV2Bal as bigint);
      setWalletDeco(decoBal as bigint);
      setWalletDlta(dltaBal as bigint);
      setDecoDecimals(Number(decoDec));
      setDltaDecimals(Number(dltaDec));

      if (podeV1Address) {
        const podeV1Bal = await rateLimit(() =>
          ethClient.readContract({
            address: podeV1Address as `0x${string}`,
            abi: ABIS.ERC721,
            functionName: "balanceOf",
            args: [address],
          }),
        );
        setWalletPodeV1(podeV1Bal as bigint);
      }
    };

    loadWalletBalances();
  }, [address, ethClient, polyClient, lensClient, podeV1Address]);

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
