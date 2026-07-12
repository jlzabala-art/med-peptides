import { NextResponse } from "next/server";
import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";
import { serverConfig } from "../../../authConfig";

const { setCustomUserClaims, getUser } = getFirebaseAuth({
  apiKey: serverConfig.firebaseApiKey,
  serviceAccount: serverConfig.serviceAccount,
});

export async function GET(request) {
  return NextResponse.json({ message: "Login API is working" }, { status: 200 });
}
