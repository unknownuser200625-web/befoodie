import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();

    cookieStore.set('auth-token', '', {
        maxAge: 0,
        path: '/'
    });

    cookieStore.set('auth-role', '', {
        maxAge: 0,
        path: '/'
    });

    return NextResponse.json({ success: true });
}
