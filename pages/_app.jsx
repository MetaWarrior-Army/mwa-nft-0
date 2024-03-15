import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '../src/wagmiconfig'

// Next Auth Session Control
import { SessionProvider } from "next-auth/react";

import Footer from '../src/footer.jsx';
import Script from 'next/script.js';

// 2. Set up a React Query client.
const queryClient = new QueryClient()

function MyApp({ Component, pageProps }) {
  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}> 
          <SessionProvider session={pageProps.session} refetchInterval={0}>
              <div className="container h-100 d-flex p-3 mx-auto flex-column">
                <Component {...pageProps} />
                <Footer/>
              </div>
              <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossOrigin="anonymous"/>
          </SessionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;