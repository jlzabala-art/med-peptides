import { NextResponse } from "next/server";

export async function GET(request) {
  return NextResponse.json({ message: "Logout API is working" }, { status: 200 });
}
