// NextJS API Helpers
import type { NextApiRequest, NextApiResponse } from 'next'
//Next Auth Server Session
import { getServerSession, NextAuthOptions } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
//DB Connection
import { Pool } from "pg";
const storetx_db_conn = new Pool({
  user: process.env.PGSQL_USER,
  password: process.env.PGSQL_PASSWORD,
  host: process.env.PGSQL_HOST,
  port: parseInt(process.env.PGSQL_PORT!),
  database: process.env.PGSQL_DATABASE,
});

// PROJECT CONFIG
import { project } from '../../src/config.jsx';
import { genString } from '../../src/functions';

// API Endpoint for creating the mailbox
const mb_create_url = process.env.MAILBOX_CREATE_URL;
console.log("Creating mailbox by posting to: "+mb_create_url);

type ResponseData = {
  success: boolean
}

// FIX THIS !!!!!!!!!
async function checkTx (tx_hash: string) {
  //const tx_url = 'https://api-zkevm.polygonscan.com/api?module=transaction&action=gettxreceiptstatus&txhash='+tx_hash+'&apikey='+process.env.POLYGONSCAN_API_KEY+'';
  /*
  var tx_res = await fetch(tx_url)
    .then((res) => {
      return res.json();
    }).then((data) => {
      if(data.status == '0'){
        return "false";
      }
      else if(data.status == '1'){
        return "true";
      }
      else{
        return "pending";
      }
    });
  */
 return true;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const session = await getServerSession(req,res,authOptions as NextAuthOptions);
  
  if(session){
  }
  else{
    console.log("No Session");
    res.status(500);
    return;
  }

  const { nonce, address, tx_hash, username, tokenid, invite_code } = req.body;

  if(req.method == 'POST'){
    console.log("storetxhash POST received")
    if(address && tx_hash){
      console.log("TokenId: "+tokenid);

      // Okay, we have a tx hash
      // We need to make sure it's successful before continuing.
      // We also need to make sure it's a transaction against our contract!!
      // we can check an api to find out if it was successful.
      // In this example we're using Polygon zkEVM Testnet.
      // So we'll try to use that.
      const tx_status = await checkTx(tx_hash);
      
      // If the Tx failed then die
      if(tx_status == false){
        res.status(500);
        return;
      }
      // This happens everytime right now
      else{
        // SUCCESSFUL TX -- SHOULD BE VALIDATED, FIX ABOVE
        // Go ahead and create the user's email account
        if(mb_create_url){
          await fetch(mb_create_url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({username: username, key: process.env.MAILBOX_CREATE_KEY}),
            });
        }

        // Create an entry in member_nfts
        const memupdate_query = "INSERT INTO member_nfts (token_id,token_uri,tx_hash,recipient,contract,blockexplorer_url,external_url,image_url) VALUES ("+tokenid+", 'nan', '"+tx_hash+"', '"+address+"', '"+project.NFT_CONTRACT_ADDRESS+"', '"+project.BLOCKEXPLORER+tx_hash+"', 'https://nft.metawarrior.army/NFTs/"+address+".json', 'https://nft.metawarrior.army/avatars/"+address+".png')";
        //console.log(memupdate_query);
        const memupdate_res = await storetx_db_conn.query(memupdate_query);

        // Update user db
        const newInviteCode = genString(8);
        //console.log("Updating User in DB");
        const update_query = "UPDATE users SET nft_0_tx='"+tx_hash+"',nft_0_id="+tokenid+", invite_code='"+newInviteCode+"' WHERE address='"+address+"'";
        const update_result = await storetx_db_conn.query(update_query);
        if(update_result.rowCount != null){
            if(update_result.rowCount > 0){
                // success, do nothing here
            }
            else{
                res.status(500);
                return;
            }
        }
      }

      // User is created, mailbox setup, now let's record the invite code used and attribute the referral if available
      // check master codes
      const check_codes_query = "SELECT * FROM codes WHERE code='"+invite_code+"'";
      const check_codes_result = await storetx_db_conn.query(check_codes_query);
      if(check_codes_result.rowCount != null){
          if(check_codes_result.rowCount > 0){
              // This is a valid Master Code
              // Increment Master Code Usage
              let times_used = check_codes_result.rows[0].times_used;
              console.log("Current times_used: "+times_used);
              times_used += 1;
              console.log("New times_used: "+times_used);
              const increment_mc_query = "UPDATE codes SET times_used = "+times_used+" WHERE code='"+invite_code+"'";
              const increment_mc_result = await storetx_db_conn.query(increment_mc_query);
          }
          else{
              // Not a Master Code, is it a user code?
              const check_userinvite_query = "SELECT * FROM users WHERE invite_code='"+invite_code+"'";
              const check_userinvite_result = await storetx_db_conn.query(check_userinvite_query);
              if(check_userinvite_result.rowCount != null){
                  if(check_userinvite_result.rowCount > 0) {
                      // This is a valid user invite code
                      // increment the number of referrals
                      let times_used = check_userinvite_result.rows[0].num_referrals;
                      times_used += 1;
                      const increment_referral_query = "UPDATE users SET num_referrals = "+times_used+" WHERE invite_code='"+invite_code+"'";
                      const increment_referral_result = await storetx_db_conn.query(increment_referral_query);
                  }
                  else{
                      // do nothing
                  }
              }
              else{
                  //do nothing
              }
          }
      }
      else{
          // Not a Master Code, is it a user code?
          const check_userinvite_query = "SELECT * FROM users WHERE invite_code='"+invite_code+"'";
          const check_userinvite_result = await storetx_db_conn.query(check_userinvite_query);
          if(check_userinvite_result.rowCount != null){
              if(check_userinvite_result.rowCount > 0) {
                  // This is a valid user invite code
                  // This is a valid user invite code
                      // increment the number of referrals
                      let times_used = check_userinvite_result.rows[0].num_referrals;
                      times_used += 1;
                      const increment_referral_query = "UPDATE users SET num_referrals = "+times_used+" WHERE invite_code='"+invite_code+"'";
                      const increment_referral_result = await storetx_db_conn.query(increment_referral_query);
              }
              else{
                  // do nothing
              }
          }
          else{
            // do nothing
          }      

      }

      res.status(200).json({success: true});
      return;

    }
    else{
        res.status(500);
        return;
    }
  }
  else{
    res.status(500);
    return;
  }
}