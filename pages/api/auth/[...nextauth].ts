// NextJS Auth
import NextAuth from "next-auth";
import { authOptions } from '@/src/authOptions'

export default NextAuth(authOptions)

