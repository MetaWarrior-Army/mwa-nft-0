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

// API Endpoint for creating the mailbox
const mb_create_url = process.env.MAILBOX_CREATE_URL;

type ResponseData = {
  success: boolean
}

// FIX THIS !!!!!!!!!
async function checkTx (tx_hash: string) {
  const tx_url = 'https://api-zkevm.polygonscan.com/api?module=transaction&action=gettxreceiptstatus&txhash='+tx_hash+'&apikey='+process.env.POLYGONSCAN_API_KEY+'';
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
 return "true";
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

  const { nonce, address, tx_hash, username, tokenid } = req.body;

  if(req.method == 'POST'){
    if(address && tx_hash && (tokenid > 0)){
      //console.log("TokenId: "+tokenid);

      // Okay, we have a tx hash
      // We need to make sure it's successful before continuing.
      // We also need to make sure it's a transaction against our contract!!
      // we can check an api to find out if it was successful.
      // In this example we're using Polygon zkEVM Testnet.
      // So we'll try to use that.
      const tx_status = await checkTx(tx_hash);
      
      // If the Tx failed then die
      if(String(tx_status) == "false"){
        res.status(500);
        return;
      }
      // This happens everytime right now
      else{
        // SUCCESSFUL TX -- SHOULD BE VALIDATED, FIX ABOVE
        // Go ahead and create the user's email account
        //console.log("Creating User Mailbox");
        if(mb_create_url){
          await fetch(mb_create_url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({username: username, key: process.env.MAILBOX_CREATE_KEY}),
            });
        }
      }

      // Update user db
      //console.log("Updating User in DB");
      const update_query = "UPDATE users SET nft_0_tx='"+tx_hash+"',nft_0_id="+tokenid+" WHERE address='"+address+"'";
      const update_result = await storetx_db_conn.query(update_query);
      if(update_result.rowCount != null){
          if(update_result.rowCount > 0){
              res.status(200).json({success: true});
              return;
          }
          else{
              res.status(500);
              return;
          }
      }
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