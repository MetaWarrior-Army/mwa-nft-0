// Web3.Storage Client
import { create } from '@web3-storage/w3up-client';

const client = await create();
await client.login(process.env.WEB3_STORAGE_LOGIN);
await client.setCurrentSpace(process.env.WEB3_STORAGE_SPACE);

export { client };