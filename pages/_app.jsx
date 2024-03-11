import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../src/wagmiconfig'

// Next Auth Session Control
import { SessionProvider } from "next-auth/react";

// 2. Set up a React Query client.
const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}> 
          <SessionProvider session={pageProps.session} refetchInterval={0}>
            <Component {...pageProps} />
          </SessionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;