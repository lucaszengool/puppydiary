import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"

// Official WeChat provider configuration using Auth.js standard
const WeChat = {
  id: "wechat",
  name: "WeChat",
  type: "oauth" as const,
  clientId: process.env.WECHAT_CLIENT_ID,
  clientSecret: process.env.WECHAT_CLIENT_SECRET,
  authorization: {
    url: "https://open.weixin.qq.com/connect/qrconnect",
    params: {
      scope: "snsapi_login",
      response_type: "code",
    }
  },
  token: {
    url: "https://api.weixin.qq.com/sns/oauth2/access_token",
    params: {
      grant_type: "authorization_code",
    }
  },
  userinfo: {
    url: "https://api.weixin.qq.com/sns/userinfo",
    async request({ tokens }: any) {
      const url = new URL("https://api.weixin.qq.com/sns/userinfo")
      url.searchParams.set("access_token", tokens.access_token!)
      url.searchParams.set("openid", tokens.openid!)
      url.searchParams.set("lang", "zh_CN")
      
      const response = await fetch(url)
      return await response.json()
    }
  },
  profile(profile: any) {
    return {
      id: profile.openid,
      name: profile.nickname,
      email: null,
      image: profile.headimgurl,
    }
  },
}

export const authOptions: NextAuthOptions = {
  providers: [
    WeChat,
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.openid = account.openid
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        openid: token.openid,
      }
    },
  },
  pages: {
    signIn: "/sign-in",
  }
}

export default NextAuth(authOptions)