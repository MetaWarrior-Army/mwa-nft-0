// NextJS Auth
import NextAuth from "next-auth";

console.log(process.env.OAUTH_CLIENTSECRET);
// MWA OAuth2 IDP
const MWAProvider = {
  id: "MWA",
  name: "MetaWarrior Army",
  type: "oauth",
  wellKnown: process.env.OAUTH_WELLKNOWN,
  authorization: { params: { scope: "openid profile", redirect_uri: process.env.OAUTH_REDIRECT_URI} },
  token: { url: process.env.OAUTH_TOKEN_URI },
  userinfo: {url: process.env.OAUTH_USERINFO },
  profile(profile) {
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

export const authOptions = {
  providers: [MWAProvider],
  callbacks: {
    async jwt({ token, user, account }) {
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
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },

    // signIn callback.
    async signIn({user,account,profile,email,credentials}){
      return true;
    },
  
  },
}

export default NextAuth(authOptions);