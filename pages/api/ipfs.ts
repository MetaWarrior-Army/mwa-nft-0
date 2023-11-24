// NextJS API Helpers
import type { NextApiRequest, NextApiResponse } from 'next'
// KUBO (IPFS) RPC CLIENT
import { create, globSource } from 'kubo-rpc-client'
// PROJECT CONFIG
import { project } from '../../src/config.jsx';
// DB Connection
import { Pool } from "pg";
//Next Auth Server Session
import { getServerSession, NextAuthOptions } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

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

const client = create({url: process.env.IPFS_RPC_URI})

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
  
  if(req.method == 'POST'){
    //console.log("test: "+test);
    //console.log("nonce: "+nonce);
    //console.log("username: "+username);
    //console.log("address: "+address);
    
    // For generating user avatar
    // Write avatar to filesystem
    // Custom identicon style
    // https://jdenticon.com/icon-designer.html?config=6b80330010770a022f431c30
    const jdenticon = require('jdenticon');
    const fs = require('fs');
    jdenticon.configure(project.JDENTICON_CONFIG);
    const avatar = jdenticon.toPng(address,80);
    const filename = process.env.NFT_AVATAR_PATH+address+process.env.NFT_IMAGE_FILEEXT;
    fs.writeFileSync(filename,avatar);
    
    //console.log("uploadIPFS");
    //console.log(filename);
    var nftJSON = {};
    var nftCID;
    var avatarCID;
    
    try{
      const avatar_cid = client.addAll(globSource(String(process.env.NFT_AVATAR_PATH),address+'*'));
      var result_count = 0;
      for await (let result of avatar_cid) {
        if(result_count == 0){
          avatarCID = result.cid;
          //console.log('avatar cid: '+String(avatarCID.toString()));
        }
      }

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
        "image": "ipfs://"+avatarCID?.toString(),
        "username": username,
        "address": address
      };
    }
    catch(error){
      console.log(error);
      res.status(500);
    }
    

    const nftJSONString = JSON.stringify(nftJSON);
    const nftPath = process.env.NFT_JSON_PATH+address+'.json';

    try{
        fs.writeFileSync(nftPath,nftJSONString);
        const nft_cid = client.addAll(globSource(String(process.env.NFT_JSON_PATH), address+'*'));
        var result_count = 0;
        for await (let result of nft_cid) {
          if(result_count == 0){
            nftCID = result.cid;
            //console.log('nft cid: '+String(nftCID.toString()));
          }
        }
               
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
      const search_result = await ipfs_db_conn.query(search_query);
      
      if(search_result.rowCount != null){
        if(search_result.rowCount > 0) {
          // Found user (This should always happen thanks to login-consent at auth)
          //console.log("FOUND USER");
          if(!search_result.rows[0].username){
            //console.log("UPDATING USER");
            const update_query = "UPDATE users SET username = '"+username+"', nft_0_avatar_cid = '"+avatarCID?.toString()+"', nft_0_cid = '"+nftCID?.toString()+"' WHERE address='"+address+"'";
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