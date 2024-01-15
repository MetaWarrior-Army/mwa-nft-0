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
        from: "0x00Ddc75A53A7b4747df232EfBad8ff7e32c2c38d",

        accounts: [`${process.env.ALCHEMY_PRIVATE_KEY}`]

     }

  },

}
