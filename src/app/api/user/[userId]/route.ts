import { NextRequest, NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    // Get user info from Clerk
    const user = await clerkClient.users.getUser(userId)

    const userInfo = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt
    }

    return NextResponse.json({ user: userInfo })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
}