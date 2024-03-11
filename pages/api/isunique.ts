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
  unique: boolean,
  status: string
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

  const { username } = req.body;
  const usernameLowered = String(username).toLowerCase();

  if(req.method == 'POST'){

    try {
        // Query the database for users and find out if they have an email address. 
        //console.log("ISUSER SEARCHING")

        if(username){
          const search_query = "SELECT * FROM users WHERE username='"+usernameLowered+"'";
          const search_result = await isuser_db_conn.query(search_query);
          
          if(search_result.rowCount != null){
            if(search_result.rowCount > 0) {
                res.status(200).json({status: 'success', unique: false});
                return;
            }
            else{
              res.status(200).json({status: 'success', unique: true});
              return;
            }
          }
        }
        else{
          res.status(500).json({status: "error", unique: false});
          return;
        }
    }
    catch(error){
        res.status(500).json({status: "error", unique: false});
        console.log(error);
        return;
    }
  }
  else{
    res.status(500).json({status: "error", unique: false});
    return;
  }
}