import { Chain } from 'wagmi'
 
export const op_sepolia = {
    id: 11155420,
    name: 'Optimism-Sepolia',
    network: 'op_sepolia',
    nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
    },
    rpcUrls: {
        public: { http: ['https://sepolia.optimism.io'] },
        default: { http: ['https://sepolia.optimism.io'] },
    },
    blockExplorers: {
        etherscan: { name: 'Etherscan', url: 'https://sepolia-optimistic.etherscan.io/' },
        default: { name: 'Etherscan', url: 'https://sepolia-optimistic.etherscan.io/' },
    },
} as const satisfies Chain