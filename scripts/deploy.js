
async function main() {

    const MWAMBR = await ethers.getContractFactory("MWAMBR");
  
  
    // Start deployment, returning a promise that resolves to a contract object
  
    const mwaMBR = await MWAMBR.deploy('0x00Ddc75A53A7b4747df232EfBad8ff7e32c2c38d');
  
    await mwaMBR.waitForDeployment();
  
    console.log("Contract deployed to address:", mwaMBR.target);
  
  }
  
  
  main()
  
    .then(() => process.exit(0))
  
    .catch((error) => {
  
      console.error(error)
  
      process.exit(1)
  
    });

    