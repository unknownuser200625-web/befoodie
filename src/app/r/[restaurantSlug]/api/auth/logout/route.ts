import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (token) {
        try {
            const decoded = jwt.decode(token) as { deviceSessionId?: string };
            const deviceSessionId = decoded?.deviceSessionId;

            if (deviceSessionId) {
                // Logical logout: set is_active = false
                await supabase
                    .from('device_sessions')
                    .update({ is_active: false })
                    .eq('id', deviceSessionId);
            }
        } catch (e) {
            console.error("Logout session deactivation error:", e);
        }
    }

    cookieStore.set('auth-token', '', {
        maxAge: 0,
        path: '/'
    });

    cookieStore.set('auth-role', '', {
        maxAge: 0,
        path: '/'
    });

    cookieStore.set('device-session-id', '', {
        maxAge: 0,
        path: '/'
    });

    return NextResponse.json({ success: true });
}
