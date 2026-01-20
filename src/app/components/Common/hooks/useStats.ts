import { getSubgraphEndpoint } from "@/app/lib/subgraph";
import { useAccount } from "wagmi";
import { useSubgraphPools, useSubgraphStakersByAddress } from "./useSubgraph";
import { useEffect, useMemo, useState } from "react";
import { createPublicClient, http, parseAbiItem, type PublicClient } from "viem";
import {
  ERC20_ABI,
  ERC721_ABI,
  MONA_EXTENDED_ABI,
  PODE_PORTAL_ABI,
} from "@/app/lib/tokenAbis";
import { MONA, TOKEN_ADDRESSES } from "@/app/lib/constants";
import { MonaStats, TransferItem } from "../types/common.types";
import { chains } from "@lens-chain/sdk/viem";
import { mainnet, polygon } from "viem/chains";

const useStats = () => {
  const { address } = useAccount();
  const ethEndpoint = getSubgraphEndpoint("eth");
  const polyEndpoint = getSubgraphEndpoint("poly");
  const ethPoolsQuery = useSubgraphPools(ethEndpoint);
  const polyPoolsQuery = useSubgraphPools(polyEndpoint);
  const ethStakersQuery = useSubgraphStakersByAddress(
    ethEndpoint,
    address?.toLowerCase(),
  );
  const polyStakersQuery = useSubgraphStakersByAddress(
    polyEndpoint,
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

  const [ethMona, setEthMona] = useState<MonaStats>();
  const [polyMona, setPolyMona] = useState<MonaStats>();
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
  const [podeV1Address, setPodeV1Address] = useState<string>();

  useEffect(() => {
    const fetchRecentTransfers = async (
      client: PublicClient,
      monaAddress: `0x${string}`,
    ) => {
      try {
        const transferEvent = parseAbiItem(
          "event Transfer(address indexed from, address indexed to, uint256 value)",
        );
        const latest = await client.getBlockNumber();
        const step = 50_000n;
        const logs: TransferItem[] = [];
        let toBlock = latest;
        let loops = 0;

        while (logs.length < 10 && toBlock > 0n && loops < 8) {
          const fromBlock = toBlock > step ? toBlock - step : 0n;
          const batch = await client.getLogs({
            address: monaAddress,
            event: transferEvent,
            fromBlock,
            toBlock,
          });
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
      const monaEthAddress = MONA.eth as `0x${string}`;
      const monaPolyAddress = MONA.poly as `0x${string}`;

      const [
        ethName,
        ethSymbol,
        ethDecimals,
        ethSupply,
        availableToMint,
        freezeCap,
        cap,
      ] = await Promise.all([
        ethClient.readContract({
          address: monaEthAddress,
          abi: MONA_EXTENDED_ABI,
          functionName: "name",
        }),
        ethClient.readContract({
          address: monaEthAddress,
          abi: MONA_EXTENDED_ABI,
          functionName: "symbol",
        }),
        ethClient.readContract({
          address: monaEthAddress,
          abi: MONA_EXTENDED_ABI,
          functionName: "decimals",
        }),
        ethClient.readContract({
          address: monaEthAddress,
          abi: MONA_EXTENDED_ABI,
          functionName: "totalSupply",
        }),
        ethClient.readContract({
          address: monaEthAddress,
          abi: MONA_EXTENDED_ABI,
          functionName: "availableToMint",
        }),
        ethClient.readContract({
          address: monaEthAddress,
          abi: MONA_EXTENDED_ABI,
          functionName: "freezeCap",
        }),
        ethClient.readContract({
          address: monaEthAddress,
          abi: MONA_EXTENDED_ABI,
          functionName: "cap",
        }),
      ]);

      const [polyName, polySymbol, polyDecimals, polySupply] =
        await Promise.all([
          polyClient.readContract({
            address: monaPolyAddress,
            abi: ERC20_ABI,
            functionName: "name",
          }),
          polyClient.readContract({
            address: monaPolyAddress,
            abi: ERC20_ABI,
            functionName: "symbol",
          }),
          polyClient.readContract({
            address: monaPolyAddress,
            abi: ERC20_ABI,
            functionName: "decimals",
          }),
          polyClient.readContract({
            address: monaPolyAddress,
            abi: ERC20_ABI,
            functionName: "totalSupply",
          }),
        ]);

      const [ethTransfers, polyTransfers] = await Promise.all([
        fetchRecentTransfers(ethClient, monaEthAddress),
        fetchRecentTransfers(polyClient, monaPolyAddress),
      ]);

      setEthMona({
        name: ethName,
        symbol: ethSymbol,
        decimals: Number(ethDecimals),
        totalSupply: ethSupply,
        availableToMint,
        freezeCap,
        cap,
        transfers: ethTransfers,
      });
      setPolyMona({
        name: polyName,
        symbol: polySymbol,
        decimals: Number(polyDecimals),
        totalSupply: polySupply,
        transfers: polyTransfers,
      });
    };

    loadMonaStats();
  }, [ethClient, polyClient]);

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
      const monaEthAddress = MONA.eth as `0x${string}`;
      const monaPolyAddress = MONA.poly as `0x${string}`;
      const monaLensAddress = MONA.lens as `0x${string}`;
      const [ethBalance, polyBalance, lensBalance] = await Promise.all([
        ethClient.readContract({
          address: monaEthAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        polyClient.readContract({
          address: monaPolyAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        lensClient.readContract({
          address: monaLensAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
      ]);
      setWalletMonaEth(ethBalance);
      setWalletMonaPoly(polyBalance);
      setWalletMonaLens(lensBalance);

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
        ethClient.readContract({
          address: genesisV1Address,
          abi: ERC721_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        polyClient.readContract({
          address: genesisV2Address,
          abi: ERC721_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        polyClient.readContract({
          address: podeV2Address,
          abi: ERC721_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        polyClient.readContract({
          address: decoAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        polyClient.readContract({
          address: dltaAddress,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        polyClient.readContract({
          address: decoAddress,
          abi: ERC20_ABI,
          functionName: "decimals",
        }),
        polyClient.readContract({
          address: dltaAddress,
          abi: ERC20_ABI,
          functionName: "decimals",
        }),
      ]);

      setWalletGenesisV1(genesisV1Bal);
      setWalletGenesisV2(genesisV2Bal);
      setWalletPodeV2(podeV2Bal);
      setWalletDeco(decoBal);
      setWalletDlta(dltaBal);
      setDecoDecimals(Number(decoDec));
      setDltaDecimals(Number(dltaDec));

      if (podeV1Address) {
        const podeV1Bal = await ethClient.readContract({
          address: podeV1Address as `0x${string}`,
          abi: ERC721_ABI,
          functionName: "balanceOf",
          args: [address],
        });
        setWalletPodeV1(podeV1Bal);
      }
    };

    loadWalletBalances();
  }, [address, ethClient, polyClient, lensClient, podeV1Address]);

  useEffect(() => {
    const loadPodeV1 = async () => {
      const portalAddress = TOKEN_ADDRESSES.eth.podePortal as `0x${string}`;
      const podeNft = await ethClient.readContract({
        address: portalAddress,
        abi: PODE_PORTAL_ABI,
        functionName: "podeNft",
      });
      setPodeV1Address(podeNft);
    };

    loadPodeV1();
  }, [ethClient]);

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
