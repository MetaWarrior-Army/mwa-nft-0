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
        from: "0x9821e26d71C4d0CAC99D280DF6dc712762312ddA",

        accounts: [`${process.env.ALCHEMY_PRIVATE_KEY}`]

     }

  },

}
