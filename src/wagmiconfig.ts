import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

const projectId = '4bacdb3e525e8b52bd47677842435182'



export const wagmiConfig = createConfig({
  chains: [sepolia ],
  connectors: [
    walletConnect({ projectId }),
    coinbaseWallet({
        appName: 'MetaWarrior Army',
      }),
    injected(),
  ],
  transports: {
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/PNbTzCQq26yaWkmn-6HqWdB6lCe3SHtk'),
  },
  ssr: true,
})