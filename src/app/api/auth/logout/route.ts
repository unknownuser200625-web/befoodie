import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();

    cookieStore.set('auth-token', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0
    });

    cookieStore.set('auth-role', '', {
        httpOnly: false,
        path: '/',
        maxAge: 0
    });

    return NextResponse.json({ success: true });
}
