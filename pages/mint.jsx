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
//import { polygon, polygonZkEvmTestnet, sepolia, optimismSepolia } from "wagmi/chains";
//import { op_sepolia } from '../src/op_sepolia.ts';
import { parseEther } from 'viem';
// NextJS helpers
import { useEffect, useState } from 'react';
import Head  from "next/head";
import Script from "next/script";
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth].js";
// PROJECT CONFIG
import { project } from '../src/config.jsx';

// Push
import { push } from 'next/router';

// MAIN APP
//
// index
function Index({ session, token, tokenURI }) {
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
            //console.log("Checking for current user");
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
    const { switchNetwork } = useSwitchNetwork();
    
    ///////////////////////////////
    // NFT MINTING CONFIGURATION //
    ///////////////////////////////
    // Minimal contract ABI
    const nftContractAbi = {
        name: 'mintNFT',
        type: 'function',
        stateMutability: 'payable',
        inputs: [{ internalType: 'address', name: 'recipient', type: 'address'}, { internalType: 'string', name: 'tokenURI', type: 'string'}],
        outputs: [],
    }
    // Transaction Details
    const { config, error: prepareError, isError: isPrepareError, } = usePrepareContractWrite({
        chainId: project.BLOCKCHAIN_ID,
        address: project.NFT_CONTRACT_ADDRESS,
        abi: [nftContractAbi],
        functionName: 'mintNFT',
        args: [address,tokenURI],
        value: parseEther("0.02"),
    });
    const { data, error, write } = useContractWrite(config); // write() triggers the transaction in the user's wallet
    const { data: walletClient, isError } = useWalletClient(); // This is handy for triggering Errors
    const { isSuccess, isLoading } = useWaitForTransaction({ // This is where we listen for successful transactions
        hash: data?.hash,
        // Mint is successful, get tokenid and record transaction
        onSuccess(data) {
            const newTokenId = parseInt(data.logs[0].topics[3],16);
            fetch(project.STORE_TX_URL, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({address: address, tx_hash: data.transactionHash, username: isUser, tokenid: newTokenId })
            });
        }
    });
    /////////////////////////////////
    /////////////////////////////////
    /////////////////////////////////

    // CONNECT WEB3 WALLET
    const connectWallet = async ({connector}) => {
        // if connected, disconnect
        if (isConnected) {
          await disconnectAsync();
        }
        // get account and chain data
        const { account, chain } = await connectAsync({connector: connector, chainId: project.BLOCKCHAIN_ID});
    };

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
                    
                    mint_button.hidden = true;
                    //console.log(isUser);
                }
            } 
        }
        catch(error){}
    };

    const checkConnection = async () => {
        if(!isUser || !txHash){
            try{
                if(isConnected){
                    // Need to validate isUser and txHash
                    // Check for current user
                    await fetch(project.IS_USER_URL, {
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
                                    push('/');
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
            }
            catch(error){}
        }
    };

    checkData();
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
        
        <div className="card text-bg-dark d-flex mx-auto mb-3" style={{width: 30+'rem'}}>
          <img className="rounded w-25 mx-auto mt-3" src={page_icon_url} alt="image cap"/>
          <div className="card-body">
          <h3 className="card-title">Mint Your MetaWarrior Army Membership</h3>
            <p className="lead">Mint Price: <span className="text-info">0.02 ETH</span></p>
            <div id="avatar_div">
                    <svg width="80" id="avatar" height="80" data-jdenticon-value={address? address : ''}></svg>
                </div>
            
            <div id="username_prompt">
                {
                    (isSuccess||txHash) ? (
                        <>
                        <span>Congrats {(isUser)}! You are now a member of MetaWarrior Army!</span>
                        <br></br>
                        <span className="small">You can view your NFT at your <a href="https://www.metawarrior.army/profile" className="link-light">profile</a>.</span>
                        </>
                    ) : isUser ? (
                        <span><p>You're username <span className="text-success"><b>{(isUser)}</b></span> has been secured.</p><p>Click below to Mint your NFT.</p></span>
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
            <div id="spinner" className="spinner-border text-secondary mb-3" role="status"
                hidden={isLoading ? false : true}
            >
                <span className="sr-only"></span>
            </div>
            <div id="form" hidden=
                {
                    !session ? true :
                    isSuccess ? true :
                    txHash ? true :
                    isUser ? false :
                    data ? true :
                    isConnected ? false : true
                }>
                
                <div className="form-group">
                    

                    <div>
                    <button id="zkevm" type="submit" 
                        onClick={() => switchNetwork(project.BLOCKCHAIN_ID)} 
                        className="btn btn-outline-secondary btn-lg w-100" 
                        hidden={
                            chain ? 
                            (chain.id != project.BLOCKCHAIN_ID) ? false : true : true
                        }>Connect to Sepolia</button>
                    <button id="buildNFT" type="submit" 
                        onClick={() => write()} 
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
                    <div>
                        <p className="small text-danger" id="web3_error"
                            hidden={
                                isSuccess ? true : false 
                            }>{
                            (isPrepareError || isError) && (
                                <span>Error: {(prepareError || error)?.message}</span>
                            )
                        }</p>
                    </div>
                    
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

            
            
            <div className="mt-5">
            <p className="small text-success" id="web3_success">
                {
                    txHash ? (
                        <span>View <a href={(project.BLOCKEXPLORER+txHash)} className="link-light" target="_blank">transaction</a>.</span>
                    ) : false
                }    
            </p>
            </div>
            <div>
            <p className="small" id="disconnect" hidden={isConnected ? false : true}>
                <a className="link-secondary" onClick={() => disconnectAsync()} href="#">disconnect</a>
            </p>
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

    if(session && token){
        //console.log(token);
        return {props: { session: session, token: token, tokenURI: token_uri }};
    }
    else{
        return {props: { }};
    }
});

export default Index;

