/**

* @type import('hardhat/config').HardhatUserConfig

*/

require('dotenv').config();

require("@nomicfoundation/hardhat-ethers");

//const { ALCHEMY_PRIVATE_KEY } = process.env;
module.exports = {

  solidity: "0.8.20",

  defaultNetwork: "zkEVM_testnet",

  networks: {

     hardhat: {},

     zkEVM_testnet: {

        url: "https://rpc.public.zkevm-test.net",
        chainId: 1442,
        from: `${process.env.WALLET_PUBLIC_KEY}`,
        accounts: [`${process.env.WALLET_PRIVATE_KEY}`]

     },

     op_sepolia: {
         url: "https://sepolia.optimism.io",
         chainId: 11155420,
         from: `${process.env.WALLET_PUBLIC_KEY}`,
         accounts: [`${process.env.WALLET_PRIVATE_KEY}`]
     }

  },

}
