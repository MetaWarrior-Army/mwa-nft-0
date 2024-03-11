/*
* Mint User NFT
* author: admin@metawarrior.army
* description: Mint User NFT for MetaWarrior Army
* url: https://www.metawarrior.army
*/
// DEPENDENCIES
// Web3 dependencies
import { useAccount, 
    useDisconnect, 
    useEnsAvatar, 
    useEnsName, 
    Connector, 
    useConnect,
    useWriteContract,
    useSwitchChain,
    useSimulateContract,
    useWaitForTransactionReceipt } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { contractAbi } from '../src/contract_abi'
import { Address } from 'viem'


// chains
//import { polygon, polygonZkEvmTestnet, sepolia, optimismSepolia } from "wagmi/chains";
//import { op_sepolia } from '../src/op_sepolia.ts';
import { parseEther } from 'viem';
// NextJS helpers
import { useEffect, useState } from 'react';
import Head  from "next/head";
import Script from "next/script";
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth";
//import { authOptions } from "./api/auth/[...nextauth].js";
import { authOptions } from '../src/authOptions'
// PROJECT CONFIG
import { project } from '../src/config.jsx';
//DB Connection
import { Pool } from "pg";

import { useRouter } from 'next/router'


// Blockies
import Blockies from 'react-blockies'

// MAIN APP
//
// index
function Index({ session, token, tokenURI, invite, username }: any) {
    // Project configuration
    const page_title = "Mint NFT "+project.PROJECT_NAME;
    const page_icon_url = project.PROJECT_ICON_URL;

    const { address, chain } = useAccount()
    const { disconnect } = useDisconnect()
    const { data: ensName } = useEnsName({ address })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName! })
    const { connectors, connect } = useConnect()
    const { isConnected } = useAccount()
    const { data: hash, writeContract } = useWriteContract()
    const { switchChain } = useSwitchChain()
    const { push } = useRouter()

    function WalletOption({
        connector,
        onClick,
    }: {
        connector: Connector
        onClick: () => void
    }) {
        const [ready, setReady] = useState(false)
    
        useEffect(() => {
        ;(async () => {
            const provider = await connector.getProvider()
            setReady(!!provider)
        })()
        }, [connector])
    
        return (
        <button className="btn btn-outline-info btn-lg w-100" disabled={!ready} onClick={onClick}>
            {connector.name}
        </button>
        )
    }

    var walletMatch;
    // Make sure session address matches connected address
    if(session.user.address == address) {
        walletMatch = true;
    }
    else{
        walletMatch = false;
    }

    function delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
    const forwardToProfile = async () => {
        await delay(5000)
        push('https://www.metawarrior.army/profile')
    }

    ///////////////////////////////
    // NFT MINTING CONFIGURATION //
    ///////////////////////////////
    // mint() function
    const { data, error } = useSimulateContract({
        abi: contractAbi,
        address: project.NFT_CONTRACT_ADDRESS as Address,
        functionName: 'mintNFT',
        args: [address as Address, tokenURI],
        value: parseEther("0.02"),
    })

    const { data: WaitForTransactionReceiptData, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({hash})
    
    if(isConfirmed){
        console.log("isConfirmed")
        const newTokenId = parseInt(WaitForTransactionReceiptData.logs[0].topics[3] as string,16);
        fetch(project.STORE_TX_URL, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({address: address, tx_hash: WaitForTransactionReceiptData.transactionHash, username: username, tokenid: newTokenId, invite_code: invite })
        });
        forwardToProfile()        
    }
    //////////////////////////////////////

    // RETURN HTML PAGE
    return (
        <>
        <Script src="https://cdn.jsdelivr.net/npm/jdenticon@3.2.0/dist/jdenticon.min.js" integrity="sha384-yBhgDqxM50qJV5JPdayci8wCfooqvhFYbIKhv0hTtLvfeeyJMJCscRfFNKIxt43M" crossOrigin="anonymous"/>
        <Head>
          <title>{page_title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
          <link rel="icon" type="image/x-icon" href={page_icon_url}></link>
        </Head>
        
        <div className="card text-bg-dark rounded shadow d-flex mx-auto mb-3" style={{width: 30+'rem'}}>
          <img className="rounded w-25 mx-auto mt-3" src={page_icon_url} alt="image cap"/>
          <div className="card-body">
          <h3 className="card-title">Mint Your MetaWarrior Army Membership</h3>
            <p className="lead">Mint Price: <span className="text-info">FREE</span></p><p className="small text-info"><i>You will need a little ETH to cover gas fees.</i></p>
            <div id="avatar_div" hidden={isConnected ? false : true}>
                <Blockies seed={address ? address.toLowerCase(): ''} size={8} scale={8}/>
                {ensAvatar && <img alt="ENS Avatar" src={ensAvatar} />}
                {address && <div className="text-info">{ensName ? `${ensName} (${address})` : address}</div>}
            </div>
            <br></br>
            
            <hr/>
            <br></br>
            <div id="spinner" className="spinner-border text-secondary mb-3" role="status"
                hidden={isConfirming ? false : true}
            >
                <span className="sr-only"></span>
            </div>
            <div id="spinner-text" hidden={isConfirming ? false : true}>
                <p className="text-warning small">Do not browse away from this page.</p>
            </div>
            <div id="success_msg"
                hidden={
                    isConfirmed ? false : true
                }
            >
                <p className="text-success">Mint Successful!</p>
                <p className="small text-warning">redirecting...</p>
            </div>
            
            <div hidden={
                isConnected ? 
                    walletMatch : true
                }>
                <p>Connected wallet doesn't match the logged in account. Please switch to wallet: <span className="text-info">{session.user.address}</span></p>
            </div>

            <div hidden={
                walletMatch ? 
                (typeof error !== 'undefined' && error !== null) ? false : true : true
            }><p>Failed to prepare Mint transaction. Usually this means you don't have enough ETH.</p><p className="small text-danger">{(typeof error !== 'undefined' && error !== null) ? error.message : '' }</p></div>

            <button hidden={
                isConnected ? 
                    walletMatch ? 
                    (typeof chain != 'undefined' && chain.id == sepolia.id) ? (!isConfirmed) ? false : true : true : true : true
                } className="btn btn-secondary btn-lg w-100 mt-3 mb-3" 
                disabled={!Boolean(data?.request)} 
                onClick={() => writeContract(data!.request)}
                >Mint NFT</button>

            <button hidden={
                isConnected ? 
                    walletMatch ? 
                    (typeof chain != 'undefined' && chain.id == sepolia.id) ? true : false : true : true
                } className="btn btn-secondary btn-lg w-100 mt-3 mb-3" onClick={() => switchChain({chainId: sepolia.id})}>Switch Network</button>
            
            <div id="connector_group" hidden={isConnected ? true : false}>
                <h5>Connect your wallet</h5>

                {connectors.map((connector) => (
                    <WalletOption
                    key={connector.uid}
                    connector={connector}
                    onClick={() => connect({ connector })}
                    />
                ))} 
                
            </div>
            <div hidden={isConnected ? false : true}>
                <button className="btn btn-outline-warning btn-lg w-100 mt-3 mb-3" onClick={() => disconnect()}>Disconnect Wallet</button>
            </div>
          </div>
        </div>
        </>
      );
}

//             //
// SERVER SIDE //
//             //
export const getServerSideProps = (async (context: any) => {
    const req = context.req;
    const res = context.res;
    const session = await getServerSession(req, res, authOptions);
    const token = await getToken({req});

    if(!session){
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    var token_uri;
    if(context.query.tokenURI) {
        const re = /ipfs/
        token_uri = context.query.tokenURI;
        if(!re.test(token_uri)){
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }
    }
    else {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    // Database connection
    const mwa_db_conn = new Pool({
        user: process.env.PGSQL_USER,
        password: process.env.PGSQL_PASSWORD,
        host: process.env.PGSQL_HOST,
        port: parseInt(process!.env!.PGSQL_PORT!),
        database: process.env.PGSQL_DATABASE,
    });

    let { invite }  = context.query;
    //console.log(invite);
    // Check for valid invite code
    if(invite){
        // check master codes
        const check_codes_query = "SELECT * FROM codes WHERE code='"+invite+"'";
        const check_codes_result = await mwa_db_conn.query(check_codes_query);
        if(check_codes_result.rowCount != null){
            if(check_codes_result.rowCount > 0){
                // This is a valid Master Code
            }
            else{
                // Not a Master Code, is it a user code?
                const check_userinvite_query = "SELECT * FROM users WHERE invite_code='"+invite+"'";
                const check_userinvite_result = await mwa_db_conn.query(check_userinvite_query);
                if(check_userinvite_result.rowCount != null){
                    if(check_userinvite_result.rowCount > 0) {
                        // This is a valid user invite code
                    }
                    else{
                        invite = false;
                    }
                }
                else{
                    invite = false;
                }
            }
        }
        else{
            // Not a Master Code, is it a user code?
            const check_userinvite_query = "SELECT * FROM users WHERE invite_code='"+invite+"'";
            const check_userinvite_result = await mwa_db_conn.query(check_userinvite_query);
            if(check_userinvite_result.rowCount != null){
                if(check_userinvite_result.rowCount > 0) {
                    // This is a valid user invite code
                }
                else{
                    invite = false;
                }
            }
            else{
                invite = false;
            }
        }
    }else{
        invite = false;
    }
    if(invite == false){
         // invalid invite, redirect to /
         return {redirect: {
            destination: "/",
            permanent: false,
        }};
    }

    // invite code valid, let's grab the username
    let username
    if("address" in session!.user!){
        const get_username_query = "SELECT username FROM users WHERE address='"+session!.user!.address+"'"
        const get_username_result = await mwa_db_conn.query(get_username_query)
        if(get_username_result.rowCount != null){
            if(get_username_result.rowCount > 0) {
                username = get_username_result.rows[0].username
            }
            else{
                // bad user
                return {redirect:{
                    destination: '/',
                    permanent: false,
                }}
            }
        }
        else{
            invite = false;
        }
    }

    mwa_db_conn.end();

    if(session && token){
        //console.log(token);
        return {props: { session: session, token: token, tokenURI: token_uri, invite, username }};
    }
    else{
        return {props: { session: session, invite }};
    }
});

export default Index;

