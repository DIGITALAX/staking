"use client";
import { createContext, SetStateAction, useEffect, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { mainnet, polygon } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet as lens, PublicClient } from "@lens-protocol/client";
import { FullScreenVideo } from "./components/Modules/types/modals.types";
import { chains } from "@lens-chain/sdk/viem";

const queryClient = new QueryClient();

export const ModalContext = createContext<
  | {
      lensClient: PublicClient | undefined;
      setFullScreenVideo: (e: SetStateAction<FullScreenVideo>) => void;
      fullScreenVideo: FullScreenVideo;
    }
  | undefined
>(undefined);

export const config = createConfig(
  getDefaultConfig({
    appName: "Material Staking",
    walletConnectProjectId: process.env
      .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    appUrl: "https://staking.digitalax.xyz",
    appIcon: "https://staking.digitalax.xyz/favicon.ico",
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
    ssr: true,
  }),
);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [lensClient, setLensClient] = useState<PublicClient | undefined>();

  const [fullScreenVideo, setFullScreenVideo] = useState<FullScreenVideo>({
    open: false,
    allVideos: [],
    index: 0,
    volume: 0.5,
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
            value={{ lensClient, fullScreenVideo, setFullScreenVideo }}
          >
            {children}
          </ModalContext.Provider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
