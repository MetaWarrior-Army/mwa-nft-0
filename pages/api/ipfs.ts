// NextJS API Helpers
import type { NextApiRequest, NextApiResponse } from 'next'
// KUBO (IPFS) RPC CLIENT
import { create, globSource } from 'kubo-rpc-client'
// PROJECT CONFIG
import { project } from '../../src/config.jsx';
 
type ResponseData = {
  message: string
}

const client = create({url: process.env.IPFS_RPC_URI})

const nftFSPath = '/home/mpoletiek/Devspace/mwa-user-nft/NFTs/'
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { test, nonce, username, address } = req.body
  
  if(req.method == 'POST'){
    console.log("test: "+test);
    console.log("nonce: "+nonce);
    console.log("username: "+username);
    console.log("address: "+address);
    
    // For generating user avatar
    const jdenticon = require('jdenticon');
    const fs = require('fs');
    // Write avatar to filesystem
    // Custom identicon style
    // https://jdenticon.com/icon-designer.html?config=6b80330010770a022f431c30
    jdenticon.configure(project.JDENTICON_CONFIG);
    const avatar = jdenticon.toPng(address,80);
    const filename = process.env.NFT_STORAGE_PATH+address+process.env.NFT_IMAGE_FILEEXT;
    fs.writeFileSync(filename,avatar);
    
    console.log("uploadIPFS");
    console.log(filename);
    var nftJSON = {};
    
    try{
      const avatar_cid = await client.add('./',globSource(filename));
      console.log("avatar cid:"+avatar_cid.path);
      // build JSON
      nftJSON = {
        "attributes": [
          {
            "Season": "Development",
            "Publisher": "https://www.metawarrior.army",
            "Quote":"Everything you want to do is on the other side of something you've never done."
          },
        ],
        "description": "MetaWarrior Army",
        "image": "ipfs://"+avatar_cid.path,
        "username": username,
        "address": address
      };
    }
    catch(error){
      console.log(error);
    }
    

    const nftJSONString = JSON.stringify(nftJSON);
    const nftPath = nftFSPath+address;

    try{
        fs.writeFileSync(nftPath,nftJSONString);
        const cid = await client.add(nftJSONString);
        console.log("nft cid: "+cid.path);

        res.status(200).json({ cid: cid.path})
    }
    catch(error){
        console.log(error);
    }
    
  }  




















  
  console.log(test)
  if(test){
    res.status(200).json({ message: test})
  }
  else{
    res.status(200).json({ message: 'Hello from Next.js!' })
  }
}