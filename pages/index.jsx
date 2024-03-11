/*
* Mint User NFT
* author: admin@metawarrior.army
* description: Mint User NFT for MetaWarrior Army
* url: https://www.metawarrior.army
*/
// DEPENDENCIES

// NextJS helpers
import Head  from "next/head";
import Script from "next/script";
//Next Auth Server Session
import { signIn } from "next-auth/react";
import { getToken } from "next-auth/jwt"
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/authOptions";
// PROJECT CONFIG
import { project } from '../src/config.jsx';
//DB Connection
import { Pool } from "pg";
// BLOCKED USERNAMES
import { blocked_users } from "../src/blocked_usernames.jsx";
// Push
import { push } from 'next/router';

// MAIN APP
//
// index
function Index({ session, token, invite, open4biz }) {
    // Project configuration
    const page_title = "Mint NFT "+project.PROJECT_NAME;
    const page_icon_url = project.PROJECT_ICON_URL;

    if(session){
        const userObj = JSON.parse(session.user.profile.userObj);
        //console.log(session);
    }


    // ToS Check
    const tosCheck = async (event) => {
        const username_input = document.getElementById('username');
        if(event.target.checked){
            username_input.disabled = false;
        }
        else{
            username_input.disabled = true;
        }
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

    const submitInviteCode = async () => {
        const inputInviteCode = document.getElementById("invitecode");
        push('https://nft.metawarrior.army/?invite='+inputInviteCode.value);

    }


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
            body: JSON.stringify({test: 'test', username: usernameLowered, address: session.user.address})
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
        push(project.MINT_URL+'ipfs://'+NFT+'&invite='+invite);
    }


    // RETURN HTML PAGE
    if(!open4biz){
        return(
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
                    <h3>Sorry, we're not accepting new members at this time.</h3>
                    <p className="small">Sign up for our <a href="https://www.metawarrior.army/sitrep" className="link-info">newsletter</a> to be the first to find out when new opportunities to join the MetaWarrior Army open up!</p>
                </div>
            </div>
            
            </>

        );
    }
    else if(invite){
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
                {   (typeof userObj !=='undefined' && userObj.nft_0_tx) ?
                    (
                        <>
                        <h3 className="card-title">MetaWarrior Army Membership NFT</h3>
                        <img width="80" src={('/avatars/'+session.user.address+'.png')}></img>
                        <h4 className="card-title">{(userObj.username)}</h4>
                        <small><a href={(project.BLOCKEXPLORER+userObj.nft_0_tx)} className="link-secondary" target="_blank">Transaction</a> | <a href={'/NFTs/'+session.user.address+'.json'} className="link-secondary" target="_blank">External</a></small>
                        <hr/>
                        </>
                    ) : (
                        <>
                        <h3 className="card-title">Now Minting Memberships</h3>
                        <small>Choose your username, mint your membership, and join the MetaWarrior Army as a Founding Member!</small>
                        <p className="lead">Mint Price: <span className="text-info">FREE</span></p><p className="small text-warning"><i>You will need a little ETH to cover gas fees.</i></p>
                        <hr/>
                        <div id="avatar_div">
                            



                        </div>
                        </>
                    )
                }
              
                
                
                
    
                
                <br></br>
                
                <div id="spinner" className="spinner-border text-secondary mb-1" role="status" hidden={true}>
                    <span className="sr-only"></span>
                </div>
    
                <div id="form" hidden=
                    {
                        !session ? true :
                        (typeof userObj !== 'undefined' && userObj.nft_0_tx) ? true :
                        (typeof userObj !== 'undefined' && userObj.username) ? true : false
                    }>
                    
                    <div className="form-group">
                        <div className="form-check mb-3">
                            <input className="form-check-input" type="checkbox" value="" id="tos-check" onChange={tosCheck}/>
                            <label className="form-check-label text-info" htmlFor="tos-check">
                                I agree to the <a className="link-light" target="_blank" href="https://www.metawarrior.army/tos">Terms of Service</a>.
                            </label>
                        </div>
                        <div id="username_prompt">
                            <span>Choose your username at MetaWarrior Army</span>
                        </div>
    
                        <div className="input-group mb-2">
                            <div className="input-group-prepend">
                                <div className="input-group-text" hidden={(typeof userObj !== 'undefined' && userObj.username) ? true : false}>
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
                                hidden={(typeof userObj !== 'undefined' && userObj.username) ? true : false}
                                defaultValue={(typeof userObj !== 'undefined' && userObj.username) ? userObj.username : ''}
                                disabled={true}></input>
                        </div>
                        
                        <p className="small text-danger" id="error_msg"></p>
                        <div>
                        <button id="buildNFT" type="submit" 
                            onClick={build_nft} 
                            className="btn btn-secondary btn-lg w-100" 
                            disabled={!session ? true : false
                            }>Build NFT</button>
                        </div>
                        <br></br>
                        
                        
                    </div>
                </div>
    
                <button id="login" type="submit"
                            onClick={() => signIn("MWA")}
                            className="btn btn-secondary btn-lg w-100 mt-3"
                            hidden={!session ? false : true}>Login
                        </button>
                <button id="logout" type="submit"
                    onClick={() => logout()}
                    className="btn btn-secondary btn-lg w-100"
                    hidden={
                        !session ? true: false
                    }>Logout
                </button>
                
                <div className="mt-5">
                </div>
              </div>
            </div>
            </>
        );
    }
    // No Invite Code provided
    else{
        return(
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



                <p className="lead mt-3 mb-3 p-3">An invite code is required to join MetaWarrior Army</p>
                <p className="small mt-3 mb-3 p-3 text-info">*Invite codes are case sensitive</p>
                <div className="form-group">
                    <div className="input-group mb-3 p-3">
                        <div className="input-group-prepend">
                            <div className="input-group-text">
                                Invite Code
                            </div>
                        </div>
                        <input type="text" 
                            name="invitecode" 
                            className="form-control" 
                            id="invitecode"
                            ></input>
                    </div>
                    <div className=" mb-3 p-3">
                    <button id="submitInviteCode" type="submit" 
                        className="btn btn-secondary btn-lg w-100" 
                        onClick={submitInviteCode}
                        >Use Invite Code</button>
                    </div>
                    <br></br>
                </div>
            </div>
        </div>
        </>
        );
    }

}
    

//             //
// SERVER SIDE //
//             //
export const getServerSideProps = (async (context) => {
    const req = context.req;
    const res = context.res;
    const session = await getServerSession(req,res,authOptions);
    const token = await getToken({req});

    let open4biz = true;

    // First let's make sure there are accounts available
    const mwa_db_conn = new Pool({
        user: process.env.PGSQL_USER,
        password: process.env.PGSQL_PASSWORD,
        host: process.env.PGSQL_HOST,
        port: parseInt(process.env.PGSQL_PORT),
        database: process.env.PGSQL_DATABASE,
      });

    const count_membernft_query = "SELECT * FROM member_nfts";
    const count_membernft_results = mwa_db_conn.query(count_membernft_query);
    if(count_membernft_results.rowCount != null){
        if(count_membernft_results.rowCount >= process.env.MAX_MEMBERS){
            // No more accounts remaining
            open4biz = false;
        }
    }
    //open4biz = false;

    // get and check invite code:
    let { invite } = context.query;
    if(invite){
        // check master codes
        const check_codes_query = "SELECT * FROM codes WHERE code='"+invite+"'";
        const check_codes_result = await mwa_db_conn.query(check_codes_query);
        if(check_codes_result.rowCount != null){
            if(check_codes_result.rowCount > 0){
                // This is a valid Master Code
                // Check if there is still a supply
                if(parseInt(check_codes_result.rows[0].times_used) >= parseInt(check_codes_result.rows[0].supply)){
                    // no more supply
                    invite = false;
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
        mwa_db_conn.end();

    }else{
        invite = false;
    }
    
    if(session && token){
        
        return {props: { session: session, token: token, invite, open4biz }};
    }
    else{
        return {props: { invite, open4biz }};
    }
});

export default Index;

