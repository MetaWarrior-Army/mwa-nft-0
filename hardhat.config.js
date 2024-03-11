/**

* @type import('hardhat/config').HardhatUserConfig

*/

require('dotenv').config();

require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");

//const { ALCHEMY_PRIVATE_KEY } = process.env;
module.exports = {

  solidity: "0.8.24",

  defaultNetwork: "zkEVM_testnet",

  etherscan: {
   apiKey: 'IR3Q2SESEHHDN7DJBRF5IQCZEJMQX9X4RS',
  },

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
     },

     sepolia: {
      chainId: 11155111,
      url: 'https://eth-sepolia.g.alchemy.com/v2/X02YuviOcTbEO3RgVIC06C_p5lg9e6cY',
      //url: 'https://dawn-lingering-hexagon.ethereum-sepolia.quiknode.pro/fc177ac80869f096c78ed635a93d671fedd523fe/',
      //url: 'https://rpc2.sepolia.org',
      from: `${process.env.WALLET_PUBLIC_KEY}`,
      accounts: [`${process.env.WALLET_PRIVATE_KEY}`],
      //gasPrice: 50000000000,
    },

  },

}
