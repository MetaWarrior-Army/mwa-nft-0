// Wagmi Web3 React Components
import { createConfig, configureChains, WagmiConfig } from "wagmi";

// Web3 Connectors
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { InjectedConnector } from 'wagmi/connectors/injected'

// Blockchain providers
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from 'wagmi/providers/infura';

// chains
import { polygon, polygonZkEvmTestnet, sepolia, optimismSepolia } from "wagmi/chains";
import { op_sepolia } from '../src/op_sepolia.ts';

// Next Auth Session Control
import { SessionProvider } from "next-auth/react";

// Project Config
import { project } from '../src/config.jsx';

// Configure chains
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [polygon, polygonZkEvmTestnet, sepolia, op_sepolia],
    [infuraProvider({ apiKey: project.INFURA_API_KEY }),publicProvider()]
  );
  
  // Setup Web3 connectors
  const config = createConfig({
    autoConnect: true,
    connectors: [
      new MetaMaskConnector({ chains }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: 'wagmi',
        },
      }),
      new WalletConnectConnector({
        chains,
        options: {
          projectId: project.WALLETCONNECT_PROJECTID,
        },
      }),
      new InjectedConnector({
        chains,
        options: {
          name: 'Browser Injected Wallet',
          shimDisconnect: true,
        },
      }),
    ],
    publicClient,
    webSocketPublicClient,
  });
  
  function MyApp({ Component, pageProps }) {
    return (
      <>
        <WagmiConfig config={config}>
          <SessionProvider session={pageProps.session} refetchInterval={0}>
            <Component {...pageProps} />
          </SessionProvider>
        </WagmiConfig>
      </>
    );
  }
  
  export default MyApp;