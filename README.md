# mwa-user-nft

MetaWarrior Army NFT 

## Dependencies

```
"@alch/alchemy-web3": "^1.4.7",
"@moralisweb3/next": "^2.23.1",
"@nomicfoundation/hardhat-ethers": "^3.0.4",
"@openzeppelin/contracts": "^5.0.0",
"body-parser": "^1.20.2",
"dom-to-image": "^2.6.0",
"dotenv": "^16.3.1",
"fs": "^0.0.1-security",
"hardhat": "^2.18.3",
"jdenticon": "^3.2.0",
"kubo-rpc-client": "^3.0.1",
"next": "13.5.6",
"next-auth": "^4.24.3",
"react": "^18",
"react-dom": "^18",
"viem": "^1.16.6",
"wagmi": "^1.4.4"
```

## Compile smart contract
Edit `.env.example` and save as `.env`.

compile with hardhat.

`npx hardhat compile`

## Deploy smart contract

`npx hardhat --network zkEVM_testnet run scripts/deploy.js`

## Run webapp

`npm run dev`