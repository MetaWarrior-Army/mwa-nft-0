// I don't think I need this
import { MoralisNextApi } from "@moralisweb3/next";


// This probably isn't used here
export default MoralisNextApi({
  apiKey: process.env.MORALIS_API_KEY!,
  authentication: {
    domain: process.env.APP_DOMAIN!,
    uri: process.env.NEXTAUTH_URL!,
    timeout: 120,
  },
});