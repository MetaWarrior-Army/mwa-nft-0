// This page is for testing various ipfs providers


//Next Auth Server Session
import { useSession, getCsrfToken, signIn, signOut } from "next-auth/react";
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
// NextJS helpers
import { useEffect, useState, useRef } from 'react';
// Push
import { push } from 'next/router';

// Web3 Storage
import { create } from '@web3-storage/w3up-client';
import { filesFromPaths } from 'files-from-path';
const client = await create();
await client.login('admin@metawarrior.army');
await client.setCurrentSpace('did:key:z6MkryKW8fcfGm8hYqKsLVi456VKWLhcLuKfNe91XMunfKvF');
//await client.remove('bafkreie7q3iidccmpvszul7kudcvvuavuo7u6gzlbobczuk5nqk3b4akba', {shards: true} );

function TestIPFS({session}) {
    /*
    if (session) {
        signOut();
    }
    */
    


    return (
        <><h1>TestIPFS</h1></>
    );
  }

  export const getServerSideProps = (async (context) => {

    var testCID;

    
    const file = await filesFromPaths(['avatars/0x00Ddc75A53A7b4747df232EfBad8ff7e32c2c38d.png']);
    const test_cid = await client.uploadFile(file[0]);
    console.log(test_cid.toString());
    

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

  
  export default TestIPFS;