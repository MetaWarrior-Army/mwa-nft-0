// NextJS API Helpers
import type { NextApiRequest, NextApiResponse } from 'next'
// DB Connection
import { Pool } from "pg";
//Next Auth Server Session
import { getServerSession, NextAuthOptions } from "next-auth";
import { authOptions } from "@/src/authOptions";

// for reading files into blob streams for web3Client upload.
// @ts-ignore 
import { filesFromPaths } from 'files-from-path';
// Web3.Storage
import {client} from '../../src/web3storage.jsx';

// Blockies
import { createCanvas } from 'canvas'; 
import { renderIcon } from '@download/blockies';

// Setup DB Connection
const ipfs_db_conn = new Pool({
  user: process.env.PGSQL_USER,
  password: process.env.PGSQL_PASSWORD,
  host: process.env.PGSQL_HOST,
  port: parseInt(process.env.PGSQL_PORT!),
  database: process.env.PGSQL_DATABASE,
});
 
type ResponseData = {
  cid: string
}

// MAIN HANDLER
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {

  const session = await getServerSession(req,res,authOptions as NextAuthOptions);
  
  if(session){
    //console.log(session);
  }
  else{
    console.log("No Session");
    res.status(500);
    return;
  }
  
  const { test, nonce, username, address } = req.body

  const usernameLowered = String(username).toLowerCase();
  //console.log(usernameLowered);
  
  if(req.method == 'POST'){
    // Some stats about the NFT we're creating
    /*
    console.log("test: "+test);
    console.log("nonce: "+nonce);
    console.log("username: "+username);
    console.log("address: "+address);
    */
    // For generating user avatar
    // Write avatar to filesystem
    const canvas = createCanvas(50, 50);
    var icon = renderIcon(
      { // All options are optional
          seed: address.toLowerCase(), // seed used to generate icon data, default: random
          size: 8, // width/height of the icon in blocks, default: 10
          scale: 8 // width/height of each block in pixels, default: 5
      },
      canvas
    );
    const img = canvas.toDataURL()
    const data = img.replace(/^data:image\/\w+;base64,/, "");
    const buf = Buffer.from(data, "base64");
    const fs = require('fs');
    const filename = process.env.NFT_AVATAR_PATH+address+process.env.NFT_IMAGE_FILEEXT;
    // Save image to Filesystem
    fs.writeFileSync(filename,buf);
    
    //console.log("uploadIPFS");
    //console.log(filename);
    var nftJSON = {};
    var nftCID;
    var avatarCID;
    
    try{
      //const avatar_cid = client.addAll(globSource(String(process.env.NFT_AVATAR_PATH),address+'*'));
      const avatarPath = process.env.NFT_AVATAR_PATH+address+'.png';
      //console.log(avatarPath);
      const avatar_files = await filesFromPaths([avatarPath]);
      const avatar_cid = await client.uploadFile(avatar_files[0]);
      // GET AVATAR CID
      avatarCID = avatar_cid;
      //console.log(avatarCID);

      // build JSON
      nftJSON = {
        "description": "MetaWarrior Army Membership",
        "external_url": "https://nft.metawarrior.army/NFTs/"+address+".json",
        "image": "ipfs://"+avatarCID?.toString(),
        "name": usernameLowered,
        "attributes": [
          {
            "trait_type": "Season",
            "value": "Development"
          },
          {
            "trait_type": "Operation",
            "value": "MWAOPRD0: Operation Campfire"

          },
          {
            "trait_type": "Publisher",
            "value":"https://www.metawarrior.army"
          },
          {
            "trait_type": "Membership Level",
            "value": "Founder"
          },
          {
            "trait_type": "username",
            "value": usernameLowered
          },
          {
            "trait_type": "address",
            "value": address
          }
        ]
      };
    }
    catch(error){
      console.log(error);
      res.status(500);
    }
    

    const nftJSONString = JSON.stringify(nftJSON);
    const nftPath = process.env.NFT_JSON_PATH+address+'.json';
    //console.log(nftPath);

    try{
        // WRITE NFT JSON TO FILESYSTEM
        //console.log("Writing JSON to FS")
        fs.writeFileSync(nftPath,nftJSONString);
        //const nft_cid = client.addAll(globSource(String(process.env.NFT_JSON_PATH), address+'*'));
        const nft_files = await filesFromPaths(nftPath);
        const nft_cid = await client.uploadFile(nft_files[0]);
        // GET NFT JSON CID
        nftCID = nft_cid;
        //console.log("NFT CID: "+nftCID);
    }
    catch(error){
        console.log(error);
        res.status(500);
    }

    // If everything was successful IPFS-wise, update our user object with their username and IPFS URLs
    // Search for current users
    try {
      //console.log("SEARCHING FOR USERS");
      const search_query = 'SELECT * FROM users WHERE address=\''+address+'\'';
      //console.log(search_query)
      const search_result = await ipfs_db_conn.query(search_query);
      
      if(search_result.rowCount != null){
        if(search_result.rowCount > 0) {
          // Found user (This should always happen thanks to login-consent at auth)
          //console.log("FOUND USER");
          if(!search_result.rows[0].username){
            //console.log("UPDATING USER");
            const update_query = "UPDATE users SET username = '"+usernameLowered+"', nft_0_avatar_cid = '"+avatarCID?.toString()+"', nft_0_cid = '"+nftCID?.toString()+"' WHERE address='"+address+"'";
            const update_result = await ipfs_db_conn.query(update_query);
            //console.log(update_result);
            if(update_result.rowCount == 1){
              //console.log("UPDATE SUCCESS");
            }
          }
          else{
            // This address already has a username. This shouldn't happen because we filter this view out if we detect a known user ahead of time
            res.status(500);
          }
        }
        else{
          // This user doesn't exist. This shouldn't happen because users should already be added and authenticated via auth
          //console.log("UPDATING USER");
          res.status(500);
        }
      }
    }
    catch(error){
      console.log(error);
      res.status(500);
    }
    
    if(nftCID){
      res.status(200).json({ cid: nftCID.toString()});
    }
    else{
      res.status(500);
    }
    
  }    
}