# nft.metawarrior.army

MetaWarrior Army NFT 

## Dependencies

```
"@alch/alchemy-web3": "^1.4.7",
    "@download/blockies": "^1.0.3",
    "@nomicfoundation/hardhat-ethers": "^3.0.4",
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "@openzeppelin/contracts": "^5.0.0",
    "@tanstack/react-query": "^5.25.0",
    "@web3-storage/w3cli": "^7.0.4",
    "@web3-storage/w3up-client": "^12.0.0",
    "canvas": "^2.11.2",
    "dotenv": "^16.3.1",
    "files-from-path": "^1.0.4",
    "fs": "^0.0.1-security",
    "hardhat": "^2.18.3",
    "hardhat-verify": "^1.0.0",
    "kubo-rpc-client": "^3.0.1",
    "next": "13.5.6",
    "next-auth": "^4.24.3",
    "pg": "^8.11.3",
    "react": "^18",
    "react-blockies": "^1.4.1",
    "react-dom": "^18",
    "viem": "^2.7.22",
    "wagmi": "^2.5.7"
```

## Compile smart contract
Edit `.env.example` and save as `.env`.

compile with hardhat.

`npx hardhat compile`

## Deploy smart contract

`npx hardhat --network zkEVM_testnet run scripts/deploy.js`

## Run webapp

Edit `src/config.example.jsx` and save as `src/config.jsx`.

Run WebApp

`npm run dev`
