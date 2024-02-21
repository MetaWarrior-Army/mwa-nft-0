/*
* Mint User NFT
* author: admin@metawarrior.army
* description: Mint User NFT for MetaWarrior Army
* url: https://www.metawarrior.army
*/
// DEPENDENCIES
// Web3 helpers
import { useAccount, 
    useNetwork, 
    useConnect, 
    useDisconnect, 
    useSwitchNetwork } from "wagmi";

// chains
// import { polygon, polygonZkEvmTestnet, sepolia, optimismSepolia } from "wagmi/chains";
// import { op_sepolia } from '../src/op_sepolia.ts';

// NextJS helpers
import { useEffect, useState, useRef } from 'react';
import Head  from "next/head";
import Script from "next/script";
//Next Auth Server Session
import { signIn } from "next-auth/react";
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
// PROJECT CONFIG
import { project } from '../src/config.jsx';
// BLOCKED USERNAMES
import { blocked_users } from "../src/blocked_usernames.jsx";
// Push
import { push } from 'next/router';

// MAIN APP
//
// index
function Index({ session, token }) {
    // Project configuration
    const page_title = "Mint NFT "+project.PROJECT_NAME;
    const page_icon_url = project.PROJECT_ICON_URL;
    const [ isUser, setIsUser ] = useState(false);
    const [ txHash, setTxHash ] = useState(false);

    // Setup Web3 Connectors
    const { chain } = useNetwork();
    const { connectAsync, connectors, pendingConnector } = useConnect({
        onError(error){
            const web3_error = document.getElementById('web3_error');
            web3_error.innerText = error.message;
        },
        // This runs the first time a user connects their wallet
        onSuccess(data) {
            const web3_success = document.getElementById('web3_success');
            const web3_error = document.getElementById('web3_error');
            web3_success.innerText = "Wallet connected!";
            web3_error.innerText = "";
            jdenticon.update('#avatar',data.account);

            // Check for current user
            fetch(project.IS_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({address: data.account})
                }).then((response) => {
                    return response.json();            
                }).then((data) => {
                    if(data.username){
                        if(data.status == 'unknownUser'){
                            push('https://www.metawarrior.army/signup');
                        }
                        else if(data.status == 'newUser'){
                        }
                        else if(data.status == 'usernameSecured') {
                            setIsUser(data.username);   
                        }
                        else if(data.status == 'Minted'){
                            setIsUser(data.username);
                            setTxHash(data.tx_hash);
                        }
                    }
                    else{
                    }
            });
        }
    });
    const { disconnectAsync } = useDisconnect();
    const { isConnected, address } = useAccount();
    // Setup smart contract TX
    const { switchNetwork } = useSwitchNetwork();

    // ToS Check
    const tosCheck = async (event) => {
        const username_input = document.getElementById('username');
        if(event.target.checked){
            username_input.disabled = false;
        }
        else{
            username_input.disabled = true;
        }
        //console.log(event.target.checked);
    }

    // SCREEN USERNAMES
    // Later we need to check a DB of usernames
    const screenUsername = async (event) => {
        const spinner = document.getElementById('spinner2');
        spinner.hidden = false;
        const error_msg = document.getElementById('error_msg');
        const button = document.getElementById('buildNFT');
        let error = false;

        if(blocked_users.includes(event.target.value)){
            //console.log("Blocked Username");
            // Blocked username
            error_msg.innerText = "Username is taken";
            button.disabled = true;
            error = true;
        }
        else if(event.target.value.length < project.MIN_USERNAME_LENGTH){
            // Empty username
            error_msg.innerText = "Username is too short";
            button.disabled = true;
            error = true;
        }
        else if(!project.username_word_re.exec(event.target.value)){
            // Non word character
            error_msg.innerText = "Invalid character in username";
            button.disabled = true;
            error = true;
        }
        else if(event.target.value.length > project.MAX_USERNAME_LENGTH){
            // too long
            error_msg.innerText = "Username too long";
            button.disabled = true;
            error = true;
        }
        // Check for unique username
        if(!error){
            await fetch(project.IS_UNIQUE_URL, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({username: event.target.value})
                }).then((response) => {
                    return response.json();            
                }).then((data) => {
                    if(data){
                        if(data.status == 'error'){
                            console.log("check isunique error");
                        }
                        else{
                            if(data.unique == true){
                                button.disabled = false;
                                error_msg.innerHTML = '<span class="text-success">Username available</span>';
                            }
                            else{
                                button.disabled = true;
                                error_msg.innerText = 'Username is taken';
                            }

                        }
                    }
                    else{
                        button.disabled = true;
                        error_msg.innerText = 'Something went wrong, please refresh and try again';
                    }
            });
        }
        spinner.hidden = true;
        
    };

    // CONNECT WEB3 WALLET
    const connectWallet = async ({connector}) => {
        // if connected, disconnect
        if (isConnected) {
          await disconnectAsync();
        }
        // get account and chain data
        const { account, chain } = await connectAsync({connector: connector, chainId: project.BLOCKCHAIN_ID});
    };

    const logout = async () => {
        const logoutURL = project.OAUTH_LOGOUT_URL+process.env.OAUTH_CLIENTID+"&id_token_hint="+token.id_token+"&post_logout_redirect_uri="+encodeURIComponent("https://nft.metawarrior.army/logout");
        //console.log(logoutURL);
        push(logoutURL);
        
    };

    //Build NFT
    const build_nft = async () => {
        var NFT;
        const username = document.getElementById('username');
        const usernameLowered = String(username.value).toLowerCase();
        const error_msg = document.getElementById('error_msg');
        const buildButton = document.getElementById('buildNFT');
        const spinner = document.getElementById('spinner');
        const form = document.getElementById('form');

        // Show loading spinner
        spinner.hidden = false;

        // Make sure we have something
        if(username.value.length < 1){
            const error_msg = document.getElementById('error_msg');
            error_msg.innerText = "Please enter a username.";
            spinner.hidden = true;
            return false;
        }

        // Check for unique username
        fetch(project.IS_UNIQUE_URL, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({username: usernameLowered})
            }).then((response) => {
                return response.json();            
            }).then((data) => {
                if(data){
                    if(data.status == 'error'){
                        error_msg.innerText = 'Something went wrong, please refresh and try again.';
                        return false;
                    }
                    else{
                        if(data.unique == true){
                            buildButton.disabled = false;
                        }
                        else{
                            buildButton.disabled = true;
                            error_msg.innerText = 'Username is taken.';
                            return false;
                        }

                    }
                }
                else{
                }
        });
        
        // Create the IPFS url
        await fetch(project.IPFS_API_URL, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({test: 'test', username: usernameLowered, address: address})
            }).then((response) => {
                return response.json();            
            }).then((data) => {
                //console.log(data);
                NFT = data.cid;
            });
        
        const button = document.getElementById("buildNFT");
        form.hidden = true;
        button.hidden = true;
        spinner.hidden = true;
        // IPFS Token URI Ready, forward to mint tx
        push(project.MINT_URL+'ipfs://'+NFT);
    }
   
    const checkConnection = async () => {
        if(!isUser || !txHash){
            try{
                if(isConnected){
                    // Need to validate isUser and txHash
                    // Check for current user
                    fetch(project.IS_USER_URL, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                        },
                        body: JSON.stringify({address: address})
                        }).then((response) => {
                            return response.json();            
                        }).then((data) => {
                            if(data){
                                if(data.status == 'unknownUser'){
                                    disconnectAsync();
                                }
                                else if(data.status == 'Minted'){
                                    setIsUser(data.username);
                                    setTxHash(data.tx_hash);
                                }
                                else if(data.status == 'usernameSecured'){
                                    setIsUser(data.username);
                                }
                            }
                            else{
                            }
                    });
                }
            }
            catch(error){}
        }
    };

    // UI Workaround?
    checkConnection();

    // This is a workaround for hydration errors 
    // caused by how we're displaying the 
    // connector options via connectors.map().
    // Essentially we just delay rendering slightly.
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        // This forces a rerender, so the value is rendered
        // the second time but not the first
        setHydrated(true);
        
    }, []);
    if (!hydrated) {
        // Returns null on first render, so the client and server match
        return null;
    }

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
            {
                txHash ? (
                    <>
                    <h3 className="card-title">MetaWarrior Army Membership NFT</h3>
                    <img width="80" src={('/avatars/'+address+'.png')}></img>
                    <h4 className="card-title">{(isUser)}</h4>
                    <small><a href={(project.BLOCKEXPLORER+txHash)} className="link-secondary" target="_blank">Transaction</a> | <a href={'/NFTs/'+address+'.json'} className="link-secondary" target="_blank">External</a></small>
                    <hr/>
                    </>
                ) : (
                    <>
                    <h3 className="card-title">Now Minting Memberships</h3>
                    <small>Choose your username, mint your membership, and join the MetaWarrior Army as a Founding Member!</small>
                    <p className="lead">Mint Price: <span className="text-info">0.02 ETH</span></p>
                    <hr/>
                    <div id="avatar_div">
                        <svg width="80" id="avatar" height="80" data-jdenticon-value={address? address : ''}></svg>
                    </div>
                    </>
                )
            }
          
            
            
            <div id="username_prompt">
                {
                    txHash ? (
                        <>
                        <a className="btn btn-lg w-100 btn-outline-secondary" href="https://www.metawarrior.army/profile">Return to your Profile</a>
                        </>
                    ) : isUser ? (
                        <span>You're username <b>{(isUser)}</b> has been secured.</span>
                    ) : isConnected ? (
                        <span>Choose a username for your wallet address: <p className="text-success">{address? address : null}</p></span>
                    ) : (
                        <span>Choose your username at MetaWarrior Army</span>
                    )
                }
            </div>

            
            <br></br>
            
            <div id="spinner" className="spinner-border text-secondary mb-1" role="status" hidden={true}>
                <span className="sr-only"></span>
            </div>

            <div id="form" hidden=
                {
                    !session ? true :
                    txHash ? true :
                    isUser ? false :
                    isConnected ? false : true
                }>
                
                <div className="form-group">
                    <div className="form-check mb-3">
                        <input className="form-check-input" type="checkbox" value="" id="tos-check" onChange={tosCheck}/>
                        <label className="form-check-label text-info" htmlFor="tos-check">
                            I agree to the <a className="link-light" target="_blank" href="https://www.metawarrior.army/tos">Terms of Service</a>.
                        </label>
                    </div>

                    <div className="input-group mb-2">
                        <div className="input-group-prepend">
                            <div className="input-group-text" hidden={isUser ? true : false}>
                                <div id="spinner2" className="spinner-border spinner-border-sm text-secondary mb-1" role="status" hidden={true}>
                                    <span className="sr-only"></span>
                                </div>
                                Username
                            </div>
                        </div>
                        <input type="text" 
                            name="username" 
                            className="form-control" 
                            id="username" 
                            onChange={screenUsername}
                            hidden={isUser ? true : false}
                            defaultValue={isUser ? isUser : ''}
                            disabled={true}></input>
                    </div>
                    
                    <p className="small text-danger" id="error_msg"></p>
                    <div>
                    <button id="zkevm" type="submit" 
                        onClick={() => switchNetwork(project.BLOCKCHAIN_ID)} 
                        className="btn btn-outline-secondary btn-lg w-100" 
                        hidden={
                            chain ? 
                            (chain.id != project.BLOCKCHAIN_ID) ? false : true : true
                        }>Connect to Sepolia</button>
                    <button id="buildNFT" type="submit" 
                        onClick={build_nft} 
                        className="btn btn-outline-secondary btn-lg w-100" 
                        hidden={isConnected ? false : true} 
                        disabled={!session ? true :
                            chain ?
                            (chain.id != project.BLOCKCHAIN_ID) ? true : false : false
                        }>Build NFT</button>
                    
                    
                    </div>
                    <br></br>
                    
                    
                </div>
            </div>
            

            <div id="connector_group" hidden={ isConnected ? true : false }>
                <h5>Connect your wallet.</h5>
                {connectors.map((connector) => (
                    // use this div to help us style the buttons
                    <div className="w-100" key={connector.id}>
                        <button type="button" className="btn btn-outline-secondary btn-lg w-100"
                            disabled={!connector.ready}
                            key={connector.id}
                            onClick={() => connectWallet({connector})}
                        >
                        {connector.name}
                        {!connector.ready && ' (unsupported)'}
                        {connector.id === pendingConnector?.id &&
                        ' (connecting)'}
                        </button>
                    </div>
                ))}
            </div>

            <button id="login" type="submit"
                        onClick={() => signIn()}
                        className="btn btn-outline-secondary btn-lg w-100"
                        hidden={!session ? false : true}>Login
                    </button>
            <button id="logout" type="submit"
                onClick={() => logout()}
                className="btn btn-outline-secondary btn-lg w-100"
                hidden={
                    !session ? true: false
                }>Logout
            </button>
            
            <div className="mt-5">
            <p className="small text-success" id="web3_success">
                {
                    
                }    
            </p>
            </div>
            <div>
            <p className="small" id="disconnect" hidden={isConnected ? false : true}>
                <a className="link-secondary" onClick={() => disconnectAsync()} href="#">disconnect</a>
            </p>
            </div>
            <div>
            <p className="small text-danger" id="web3_error"
                hidden={
                    txHash ? true : false
                }></p>
            </div>

            

          </div>
        </div>
        </>
      );
}

//             //
// SERVER SIDE //
//             //
export const getServerSideProps = (async (context) => {
    const req = context.req;
    const res = context.res;
    const session = await getServerSession(req,res,authOptions);
    const token = await getToken({req});
    
    if(session && token){
        //console.log(token);
        return {props: { session: session, token: token }};
    }
    else{
        return {props: { }};
    }
});

export default Index;

