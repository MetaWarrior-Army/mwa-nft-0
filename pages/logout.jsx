//Next Auth Server Session
import { useSession, getCsrfToken, signIn, signOut } from "next-auth/react";
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/authOptions";
// NextJS helpers
import { useEffect, useState, useRef } from 'react';
// Push
import { push } from 'next/router';

function Logout({session}) {
    if (session) {
        signOut();
    }

    return (
    <>
        <div><h1>Logout</h1></div>
    </>
    
    );
  }

  export const getServerSideProps = (async (context) => {
    const req = context.req;
    const res = context.res;
    const session = await getServerSession(req,res,authOptions);
    if(session){
        return {props: {session: session}};
    }
    else{
        return {redirect: {
            destination: "/",
            permanent: false,
        }};
    }

  });

  
  export default Logout;