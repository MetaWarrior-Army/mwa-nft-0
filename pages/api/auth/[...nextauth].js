// NextJS Auth
import NextAuth from "next-auth";
// Moralis Auth Provider
import { MoralisNextAuthProvider } from "@moralisweb3/next";

const MWAProvider = {
  id: "MWA",
  name: "MetaWarrior Army",
  type: "oauth",
  wellKnown: "https://auth.metawarrior.army/.well-known/openid-configuration",
  authorization: { params: { scope: "openid profile", redirect_uri: "https://nft.metawarrior.army/api/auth/callback/MWA"} },
  token: { url: "https://auth.metawarrior.army/oauth2/token" },
  userinfo: {url: "https://auth.metawarrior.army/userinfo" },
  profile(profile) {
    return {
      id: JSON.parse(profile.user).id,
      address: profile.address,
      username: JSON.parse(profile.user).username,
      profile: profile,
    }
  },
  checks: ["pkce", "state"],
  clientId: "5e9abc24-501c-448a-92f5-d708406a0424",
  clientSecret: "tcHRv0Pjeqxrf4b-_Jx0U8kpM_",
}

export const authOptions = {
  providers: [MWAProvider],
  callbacks: {
    async jwt({ token, user, account }) {
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