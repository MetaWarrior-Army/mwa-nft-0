// NextJS API Helpers
import type { NextApiRequest, NextApiResponse } from 'next'
//Next Auth Server Session
import { getServerSession, NextAuthOptions } from "next-auth";
import { authOptions } from "@/src/authOptions";
//DB Connection
import { Pool } from "pg";
const isuser_db_conn = new Pool({
  user: process.env.PGSQL_USER,
  password: process.env.PGSQL_PASSWORD,
  host: process.env.PGSQL_HOST,
  port: parseInt(process.env.PGSQL_PORT!),
  database: process.env.PGSQL_DATABASE,
});

type ResponseData = {
  username: string | undefined,
  tx_hash: string | undefined,
  status: string | undefined
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
    //console.log("No Session");
    res.status(500);
    return;
  }

  const { nonce, address } = req.body;

  if(req.method == 'POST'){

    try {
        // Query the database for users and find out if they have an email address. 
        //console.log("ISUSER SEARCHING")

        if(address){
          //console.log("Address: "+address);
          const search_query = "SELECT * FROM users WHERE address='"+address+"'";
          const search_result = await isuser_db_conn.query(search_query);
          
          if(search_result.rowCount != null){
            if(search_result.rowCount > 0) {
                //we have a result. Do they have a username?
                if(search_result.rows[0].username){
                    //console.log("FOUND USER");
                    if(search_result.rows[0].nft_0_tx){
                      res.status(200).json({ 
                        username: search_result.rows[0].username,
                        tx_hash: search_result.rows[0].nft_0_tx,
                        status: "Minted"
                      });
                      res.status(200);
                      return;
                    }
                    else{
                      res.status(200).json({ 
                        username: search_result.rows[0].username,
                        tx_hash: '',
                        status: "usernameSecured"
                      });
                      res.status(200);
                      return;
                    }
                    
                }
                else{
                    //console.log("NEW USER");
                    res.status(200).json({username: '',tx_hash: '', status: 'newUser'});
                    return;
                }
            }
            else{
                // This shouldn't happen because we're supposed to authenticate users and record their address then during auth
                console.log("RESULTS ERROR");
                res.status(200).json({ username: '', tx_hash: '', status: 'unknownUser'});
                return;
            }
          }
        }
        else{
          res.status(500);
          console.log("no address");
          return;
        }
    }
    catch(error){
        res.status(500);
        console.log(error);
        return;
    }
  }
  else{
    res.status(500);
    return;
  }
}