"use client";
import { createContext, SetStateAction, useEffect, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { ConnectKitProvider } from "connectkit";
import { mainnet, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet as lens, PublicClient } from "@lens-protocol/client";
import { FullScreenVideo } from "./components/Modules/types/modals.types";
import { chains } from "@lens-chain/sdk/viem";
import { MonaStats } from "./components/Common/types/common.types";

type StatsCache = {
  loaded: boolean;
  ethMona?: MonaStats;
  polyMona?: MonaStats;
  podeV1Address?: `0x${string}`;
};

const queryClient = new QueryClient();

export const ModalContext = createContext<
  | {
      lensClient: PublicClient | undefined;
      setFullScreenVideo: (e: SetStateAction<FullScreenVideo>) => void;
      fullScreenVideo: FullScreenVideo;
      statsCache: StatsCache;
      setStatsCache: (e: SetStateAction<StatsCache>) => void;
    }
  | undefined
>(undefined);

const connectors = [injected({ target: "metaMask" })];

export const config = createConfig({
  chains: [mainnet, polygon, chains.mainnet],
  transports: {
    [mainnet.id]: http(
      `https://rpc.lens.xyz/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    ),
    [polygon.id]: http(
      `https://rpc.lens.xyz/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    ),
    [chains.mainnet.id]: http("https://rpc.lens.xyz"),
  },
  connectors,
  ssr: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [lensClient, setLensClient] = useState<PublicClient | undefined>();

  const [fullScreenVideo, setFullScreenVideo] = useState<FullScreenVideo>({
    open: false,
    allVideos: [],
    index: 0,
    volume: 0.5,
  });
  const [statsCache, setStatsCache] = useState<StatsCache>({
    loaded: false,
  });

  useEffect(() => {
    if (!lensClient) {
      setLensClient(
        PublicClient.create({
          environment: lens,
          storage: window.localStorage,
        }),
      );
    }
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <ModalContext.Provider
            value={{
              lensClient,
              fullScreenVideo,
              setFullScreenVideo,
              statsCache,
              setStatsCache,
            }}
          >
            {children}
          </ModalContext.Provider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
