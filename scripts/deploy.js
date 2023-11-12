
async function main() {

    const MWANFT = await ethers.getContractFactory("MWANFT");
  
  
    // Start deployment, returning a promise that resolves to a contract object
  
    const mwaNFT = await MWANFT.deploy('0x9821e26d71C4d0CAC99D280DF6dc712762312ddA');
  
    await mwaNFT.waitForDeployment();
  
    console.log("Contract deployed to address:", mwaNFT.target);
  
  }
  
  
  main()
  
    .then(() => process.exit(0))
  
    .catch((error) => {
  
      console.error(error)
  
      process.exit(1)
  
    });