import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { getDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const db = getDB();

    let authenticated = false;
    let role = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
            authenticated = true;
            role = decoded.role;
        } catch (e) {
            // Invalid token
        }
    }

    return NextResponse.json({
        authenticated,
        role,
        isSystemOpen: db?.isSystemOpen ?? false
    });
}
