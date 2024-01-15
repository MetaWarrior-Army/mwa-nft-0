
async function main() {

    const MWANFT = await ethers.getContractFactory("MWANFT");
  
  
    // Start deployment, returning a promise that resolves to a contract object
  
    const mwaNFT = await MWANFT.deploy('0x00Ddc75A53A7b4747df232EfBad8ff7e32c2c38d');
  
    await mwaNFT.waitForDeployment();
  
    console.log("Contract deployed to address:", mwaNFT.target);
  
  }
  
  
  main()
  
    .then(() => process.exit(0))
  
    .catch((error) => {
  
      console.error(error)
  
      process.exit(1)
  
    });

    