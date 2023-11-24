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

type ResponseData = {
  success: boolean
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

  const { nonce, address, tx_hash } = req.body;

  if(req.method == 'POST'){
    if(address && tx_hash){
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