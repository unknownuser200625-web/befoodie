import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { getDB, saveDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { role, password, pin } = body;
        const db = getDB();

        let authenticatedRole = "";

        if (role === "owner") {
            if (password === process.env.OWNER_PASSWORD) {
                authenticatedRole = "owner";
                if (db) {
                    db.isSystemOpen = true;
                    saveDB(db);
                }
            }
        } else if (role === "staff") {
            if (pin === process.env.KITCHEN_PIN) {
                if (db && !db.isSystemOpen) {
                    return NextResponse.json(
                        { success: false, error: "System not yet opened by owner" },
                        { status: 403 }
                    );
                }
                authenticatedRole = "staff";
            }
        }

        if (authenticatedRole) {
            const token = jwt.sign({ role: authenticatedRole }, JWT_SECRET, { expiresIn: '12h' });

            const cookieStore = await cookies();

            cookieStore.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 12 * 60 * 60
            });

            cookieStore.set('auth-role', authenticatedRole, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 12 * 60 * 60
            });

            return NextResponse.json({ success: true, role: authenticatedRole });
        }

        return NextResponse.json(
            { success: false, error: "Invalid credentials" },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
