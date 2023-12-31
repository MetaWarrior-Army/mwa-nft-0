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
    useContractWrite, 
    usePrepareContractWrite,
    useWaitForTransaction,
    useSwitchNetwork,
    useWalletClient } from "wagmi";
// chains
import { polygon, polygonZkEvmTestnet } from "wagmi/chains";
// NextJS helpers
import { useEffect, useState, useRef } from 'react';
import Head  from "next/head";
import Script from "next/script";
//Next Auth Server Session
import { useSession, getCsrfToken, signIn, signOut } from "next-auth/react";
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
// PROJECT CONFIG
import { project } from '../src/config.jsx';
// BLOCKED USERNAMES
import { blocked_users } from "../src/blocked_usernames.jsx";
// Push
import { push } from 'next/router';
// For cleaning username input
const word_re = /^\w+$/;
// IPFS API Endpoint
const ipfsApiUrl = 'https://nft.metawarrior.army/api/ipfs';
const isUserUrl = 'https://nft.metawarrior.army/api/isuser';
const storeTxUrl = 'https://nft.metawarrior.army/api/storetxhash';

// MAIN APP
//
// index
function Index({ session, token }) {
    // Project configuration
    const page_title = "Mint NFT "+project.PROJECT_NAME;
    const page_icon_url = project.PROJECT_ICON_URL;
    const [ isUser, setIsUser ] = useState(false);
    const [ txHash, setTxHash ] = useState(false);
    // We set this after the CID has been established (IPFS)
    const [ nftReady, setNftReady ] = useState(false);
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
            //console.log("Checking for current user");
            fetch(isUserUrl, {
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
    const { config, error: prepareError, isError: isPrepareError, } = usePrepareContractWrite({
        chainId: project.BLOCKCHAIN_ID,
        address: project.NFT_CONTRACT_ADDRESS,
        abi: [
            {
                name: 'mintNFT',
                type: 'function',
                stateMutability: 'payable',

                inputs: [{ internalType: 'address', name: 'recipient', type: 'address'}, { internalType: 'string', name: 'tokenURI', type: 'string'}],
                outputs: [],
            },
        ],
        functionName: 'mintNFT',
        args: [ address, nftReady ],
    });
    const { data, error, write } = useContractWrite(config);
    const { isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });
    const { data: walletClient, isError, isLoading } = useWalletClient();

    // SCREEN USERNAMES
    // Later we need to check a DB of usernames
    const screenUsername = async (event) => {
        const error_msg = document.getElementById('error_msg');
        const button = document.getElementById('buildNFT');

        if(blocked_users.includes(event.target.value)){
            //console.log("Blocked Username");
            // Blocked username
            error_msg.innerText = "Username is taken.";
            button.disabled = true;
        }
        else if(event.target.value.length < project.MIN_USERNAME_LENGTH){
            // Empty username
            error_msg.innerText = "Username is too short.";
            button.disabled = true;
        }
        else if(!word_re.exec(event.target.value)){
            // Non word character
            error_msg.innerText = "Invalid character in username.";
            button.disabled = true;
        }
        else if(event.target.value.length > project.MAX_USERNAME_LENGTH){
            // too long
            error_msg.innerText = "Username too long.";
            button.disabled = true;
        }
        else{
            error_msg.innerText = "";
            button.disabled = false;
        }

        // Check for unique username
        fetch('https://nft.metawarrior.army/api/isunique', {
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
                            error_msg.innerText = 'Username available.';
                        }
                        else{
                            button.disabled = true;
                            error_msg.innerText = 'Username is taken.';
                        }

                    }
                }
                else{
                }
        });
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

    // Disconnect Wallet Button
    const disconnectWallet = async () => {
        await disconnectAsync();
        return true;
    }

    const logout = async () => {
        const logoutURL = "https://auth.metawarrior.army/oauth2/sessions/logout?client_id="+project.MWA_AUTH_CLIENTID+"&id_token_hint="+token.id_token+"&post_logout_redirect_uri="+encodeURIComponent("https://nft.metawarrior.army/logout");
        //console.log(logoutURL);
        push(logoutURL);
        
    };

       // Function for adding the chain to the user's wallet if they don't have it
    const addChain = async () => {
        await walletClient.addChain({ chain: polygonZkEvmTestnet });
        switchNetwork(project.BLOCKCHAIN_ID);
    }

    //Build NFT
    const build_nft = async () => {
        //console.log("Building NFT");
        var NFT;
        // Make sure username isn't blank
        const username = document.getElementById('username');
        const usernameLowered = String(username.value).toLowerCase();
        const error_msg = document.getElementById('error_msg');
        const buildButton = document.getElementById('buildNFT');
        const pending = document.getElementById('pending');
        pending.hidden = false;

        // Make sure we have something
        if(username.value.length < 1){
            const error_msg = document.getElementById('error_msg');
            error_msg.innerText = "Username cannot be blank.";
            return false;
        }

        // Check for unique username
        fetch('https://nft.metawarrior.army/api/isunique', {
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
                        //console.log("check isunique error");
                        pending.hidden = true;
                        return false;
                    }
                    else{
                        if(data.unique == true){
                            buildButton.disabled = false;
                            //error_msg.innerText = 'Username available.';
                        }
                        else{
                            buildButton.disabled = true;
                            error_msg.innerText = 'Username is taken.';
                            pending.hidden = true;
                            return false;
                        }

                    }
                }
                else{
                }
        });

        //log(usernameLowered);
        
        // Create the IPFS url
        await fetch(ipfsApiUrl, {
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
        
        // Set NFT CID in state
        setNftReady(NFT);

        const button = document.getElementById("buildNFT");
        button.hidden = true;

        // Execute transaction
        await write();
        pending.hidden = true;
        
    }

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
    
    // Another UI Workaround
    // Not sure why I have to do this for the first time someone connects a wallet. 
    // The React UI works fine after that.
    const checkData = async() => {
        try{
            const web3_success = document.getElementById('web3_success');
            const mint_button = document.getElementById('buildNFT');
            const username_prompt = document.getElementById('username_prompt');
            const pending = document.getElementById('pending');
            if(data){
                console.log("DATA:");
                console.log(data);
                if(isError){
                    // safely quit here
                    pending.hidden = true;
                    return;
                }
                else if (isLoading){
                    pending.hidden = false;
                }
                else{
                    pending.hidden = true;
                    username_prompt.innerHTML = '<span>Congrats! You are now a member of MetaWarrior Army!</span><br><span class="small">Back to your <a href="https://www.metawarrior.army/profile" class="link-light">profile</a>.</span>'
                    web3_success.innerHTML = '<span>View <a href="'+project.BLOCKEXPLORER+data.hash+'" class="link-light" target="_blank">transaction</a>.</span>';
                    // Update user
                    var hash = data.hash;
                    fetch(storeTxUrl, {
                        method: 'POST',
                        headers: {
                            'Content-type': 'application/json',
                        },
                        body: JSON.stringify({address: address, tx_hash: hash, username: isUser })
                    });
                    mint_button.hidden = true;
                    console.log(isUser);
                }
                
                
            } 
        }
        catch(error){}
    };

    const checkConnection = async () => {
        try{
            if(isConnected){
                // Need to validate isUser and txHash
                // Check for current user
                //console.log("Checking for current user");
                fetch(isUserUrl, {
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
                                push('https://www.metawarrior.army/dev/signup.php');
                                //signIn();
                            }
                            if(data.tx_hash != ''){
                                setIsUser(data.username);
                                    setTxHash(data.tx_hash);
                            }
                            else{
                                setIsUser(data.username);
                            }
                        }
                        else{
                        }
                });
            }
            else{
    
            }
        }
        catch(error){}
    };

    checkData();
    checkConnection();   

    // RETURN HTML PAGE
    return (
        <>
        <Script src="https://cdn.jsdelivr.net/npm/jdenticon@3.2.0/dist/jdenticon.min.js" integrity="sha384-yBhgDqxM50qJV5JPdayci8wCfooqvhFYbIKhv0hTtLvfeeyJMJCscRfFNKIxt43M" crossOrigin="anonymous"/>
        <Head>
          <title>{page_title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
          <link rel="icon" type="image/x-icon" href={page_icon_url}></link>
        </Head>
        
        <div className="card text-bg-dark d-flex mx-auto" style={{width: 30+'rem'}}>
          <img className="rounded w-25 mx-auto" src={page_icon_url} alt="image cap"/>
          <div className="card-body">
            <h5 className="card-title"><u>Mint User NFT</u></h5>
            <div id="avatar_div">
                    <svg width="80" id="avatar" height="80" data-jdenticon-value={address? address : ''}></svg>
                </div>
            
            <div id="username_prompt">
                {
                    txHash ? (
                        <>
                        <span>Congrats! You are now a member of MetaWarrior Army!</span>
                        <br></br>
                        <span className="small">You can view your mint transaction <a href={("https://testnet-zkevm.polygonscan.com/tx/"+txHash)} className="link-light" target="_blank">here</a>.</span>
                        <br></br>
                        <span className="small">You can view your NFT at your <a href="https://www.metawarrior.army/profile" className="link-light">profile</a>.</span>
                        </>
                    ) : isUser ? (
                        <span>You're username <b>{(isUser)}</b> has been secured. Check your wallet to finish minting your NFT.</span>
                    ) : data ? (
                        <span>Mint executed for: <p className="text-info">{address? address : null}</p></span>
                    ) : isConnected ? (
                        <span>Choose a username for your wallet address: <p className="text-info">{address? address : null}</p></span>
                    ) : (
                        <span>Choose your username at MetaWarrior Army</span>
                    )
                }
            </div>

            <hr/>
            <br></br>
            <div className="spinner-border text-light" id="pending" hidden>
                <span className="sr-only">Loading...</span>
            </div>
            <div id="form" hidden=
                {
                    !session ? true :
                    txHash ? true :
                    isUser ? false :
                    data ? true :
                    isConnected ? false : true
                }>
                
                <div className="form-group">
                    <div className="input-group mb-2">
                        <div className="input-group-prepend">
                            <div className="input-group-text" hidden={isUser ? true : false}>Username</div>
                        </div>
                        <input type="text" 
                            name="username" 
                            className="form-control" 
                            id="username" 
                            onChange={screenUsername}
                            hidden={isUser ? true : false}
                            defaultValue={isUser ? isUser : ''}></input>
                    </div>
                    <br></br>
                    <div>
                    <button id="zkevm" type="submit" 
                        onClick={() => addChain()} 
                        className="btn btn-outline-secondary btn-lg w-100" 
                        hidden={
                            chain ? 
                            (chain.id != project.BLOCKCHAIN_ID) ? false : true : true
                        }>Connect to zkEVM</button>
                    <button id="buildNFT" type="submit" 
                        onClick={build_nft} 
                        className="btn btn-outline-secondary btn-lg w-100" 
                        hidden={isConnected ? false : true} 
                        disabled={data ? true :
                            !session ? true :
                            chain ?
                            (chain.id != project.BLOCKCHAIN_ID) ? true : false : false
                        }>Mint NFT</button>
                    
                    
                    </div>
                    <br></br>
                    <p className="small text-danger" id="error_msg"></p>
                    
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
                        {isLoading &&
                        connector.id === pendingConnector?.id &&
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
                    data ? (
                        <span>View <a href={(project.BLOCKEXPLORER+data.hash)} className="link-light" target="_blank">transaction</a>.</span>
                    ) : isConnected ? (
                        <span>Wallet connected.</span>
                    ) : false
                }    
            </p>
            </div>
            <div>
            <p className="small" id="disconnect" hidden={isConnected ? false : true}>
                <a className="link-light" onClick={() => disconnectWallet()} href="#">Disconnect Wallet</a>
            </p>
            </div>
            <div>
            <p className="small text-danger" id="web3_error"
                hidden={
                    txHash ? true : false
                }>{
                (isPrepareError || isError) && (
                    <span>Error: {(prepareError || error)?.message}</span>
                )
            }</p>
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
    //console.log(session);

    if(session && token){
        //console.log(token);
        return {props: { session: session, token: token }};
    }
    else{
        return {props: { }};
    }
});

export default Index;

