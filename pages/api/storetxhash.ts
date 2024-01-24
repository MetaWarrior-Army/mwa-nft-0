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

const mb_create_url = process.env.MAILBOX_CREATE_URL;

type ResponseData = {
  success: boolean
}


// FIX THIS FOR OPTIMISM
async function checkTx (tx_hash: string) {
  const tx_url = 'https://api-zkevm.polygonscan.com/api?module=transaction&action=gettxreceiptstatus&txhash='+tx_hash+'&apikey='+process.env.POLYGONSCAN_API_KEY+'';
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
}

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

  const { nonce, address, tx_hash, username } = req.body;

  if(req.method == 'POST'){
    if(address && tx_hash){

      // Okay, we have a tx hash
      // We need to make sure it's successful before continuing.
      // We also need to make sure it's a transaction against our contract!!
      // we can check an api to find out if it was successful.
      // In this example we're using Polygon zkEVM Testnet.
      // So we'll try to use that.
      const tx_status = await checkTx(tx_hash);
      console.log(tx_status);
      // If the Tx failed then die
      if(String(tx_status) == "false"){
        res.status(500);
        return;
      }
      else if (String(tx_status) == "pending"){
        // Not sure what to do here. The API is very limiting.
      }
      else{
        console.log("SUCCESSFUL TX");

        // Go ahead and create the user's email account

        // Check for unique username
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

      //console.log("UPDATING USER");
      const update_query = "UPDATE users SET nft_0_tx='"+tx_hash+"' WHERE address='"+address+"'";
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