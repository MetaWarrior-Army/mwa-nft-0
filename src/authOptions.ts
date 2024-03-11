import { NextAuthOptions } from "next-auth";

// MWA OAuth2 IDP
//const MWAProvider = 
  
  export const authOptions: NextAuthOptions = {
    providers: [
      {
        id: "MWA",
        name: "MetaWarrior Army",
        type: "oauth",
        wellKnown: process.env.OAUTH_WELLKNOWN,
        authorization: { params: { scope: "openid profile", redirect_uri: process.env.OAUTH_REDIRECT_URI} },
        token: { url: process.env.OAUTH_TOKEN_URI },
        userinfo: {url: process.env.OAUTH_USERINFO },
        profile(profile: any) {
          //console.log(profile);
          return {
            id: JSON.parse(profile.userObj).id,
            address: profile.address,
            username: profile.username,
            profile: profile,
          }
        },
        checks: ["pkce", "state"],
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENTSECRET,
      }
    ],
    callbacks: {
      async jwt({ token, user, account }: any) {
        //console.log(user);
        if (user) {
          token.user = user;
        }
        if (account) {
          token.id_token = account.id_token;
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }: any) {
        session.user = token.user;
        return session;
      },
  
      // signIn callback.
      async signIn({user,account,profile,email,credentials}: any){
        return true;
      },
    
    },
  }