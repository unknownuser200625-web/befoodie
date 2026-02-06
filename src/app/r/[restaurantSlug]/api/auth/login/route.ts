import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";
import * as bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const AUTH_DEBUG = process.env.AUTH_DEBUG === 'true';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;

        // --- TRACE MODE: Task 3 - Raw Payload Integrity ---
        const rawJson = await req.json();
        if (AUTH_DEBUG) console.log(`[TRACE] RAW REQUEST BODY: ${JSON.stringify(rawJson)}`);

        const { role, password, pin } = rawJson;

        // --- TRACE MODE: Task 2 - Slug Routing ---
        if (AUTH_DEBUG) {
            console.log(`[TRACE] Received Slug: "${restaurantSlug}"`);
            console.log(`[TRACE] Password Provided: ${password ? 'YES (Length: ' + password.length + ')' : 'NO'}`);
            console.log(`[TRACE] PIN Provided: ${pin ? 'YES (Length: ' + pin.length + ')' : 'NO'}`);
        }

        // Fetch restaurant details for authentication info
        const { data: restaurant, error: fetchError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('slug', restaurantSlug)
            .single();

        if (fetchError || !restaurant) {
            if (AUTH_DEBUG) console.log(`[TRACE] FAILED: Restaurant NOT FOUND for slug: "${restaurantSlug}"`);
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        if (AUTH_DEBUG) {
            console.log(`[TRACE] RESOLVED restaurant_id: ${restaurant.id}`);
            console.log(`[TRACE] Attempting login for role: ${role}`);
        }

        let authenticatedRole = "";

        if (role === "owner") {
            const storedHash = restaurant.owner_password_hash || "";
            if (AUTH_DEBUG) console.log(`[TRACE] Comparing Owner Password against hash: ${storedHash.substring(0, 10)}...`);
            const isValid = await bcrypt.compare(password, storedHash);
            if (AUTH_DEBUG) console.log(`[TRACE] RESULT: ${isValid ? 'MATCH FOUND' : 'MISMATCH'}`);
            if (isValid) {
                authenticatedRole = "owner";
            }
        } else if (role === "staff") {
            const storedHash = restaurant.staff_pin_hash || "";
            if (AUTH_DEBUG) console.log(`[TRACE] Comparing Staff PIN against hash: ${storedHash.substring(0, 10)}...`);
            const isValid = await bcrypt.compare(pin, storedHash);
            if (AUTH_DEBUG) console.log(`[TRACE] RESULT: ${isValid ? 'MATCH FOUND' : 'MISMATCH'}`);
            if (isValid) {
                authenticatedRole = "staff";
            }
        }

        if (authenticatedRole) {
            // --- POS SESSION REFACTOR: Staff Login Guard ---
            if (authenticatedRole === 'staff') {
                const today = new Date().toISOString().split('T')[0];
                const { data: opsSession, error: opsError } = await supabase
                    .from('restaurant_operational_sessions')
                    .select('id')
                    .eq('restaurant_id', restaurant.id)
                    .eq('business_date', today)
                    .eq('status', 'active')
                    .maybeSingle();

                if (opsError || !opsSession) {
                    if (AUTH_DEBUG) console.log(`[TRACE] Staff login BLOCKED: No active operational session for today.`);
                    return NextResponse.json(
                        { success: false, error: "SYSTEM CLOSED: No active business session found." },
                        { status: 403 }
                    );
                }
            }

            // --- Phase 2: Device Session Creation ---
            const userAgent = req.headers.get('user-agent') || 'Unknown';
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '0.0.0.0';

            // Optional Device Name from body
            const { deviceName: inputDeviceName } = rawJson;
            const fallbackDeviceName = `${userAgent.split(' ')[0]} — ${new Date().toLocaleTimeString()}`;
            const finalDeviceName = inputDeviceName || fallbackDeviceName;

            // Create new device session (Logical creation, no reuse)
            const { data: sessionData, error: sessionError } = await supabase
                .from('device_sessions')
                .insert({
                    restaurant_id: restaurant.id,
                    role: authenticatedRole,
                    device_name: finalDeviceName,
                    browser: userAgent,
                    ip_address: ip,
                    is_active: true
                })
                .select('id')
                .single();

            if (sessionError || !sessionData) {
                console.error("Failed to create device session:", sessionError);
                return NextResponse.json({ error: "Session creation failed" }, { status: 500 });
            }

            const deviceSessionId = sessionData.id;

            // JWT includes restaurant info + deviceSessionId for display isolation
            const token = jwt.sign(
                {
                    role: authenticatedRole,
                    restaurantId: restaurant.id,
                    restaurantSlug: restaurant.slug,
                    deviceSessionId: deviceSessionId
                },
                JWT_SECRET,
                { expiresIn: '12h' }
            );

            const cookieStore = await cookies();

            cookieStore.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 12 * 60 * 60
            });

            // Set Device Session ID for easier client-side tracking (optional but helpful for display identification)
            cookieStore.set('device-session-id', deviceSessionId, {
                httpOnly: false,
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

            return NextResponse.json({
                success: true,
                role: authenticatedRole,
                deviceSessionId: deviceSessionId
            });
        }

        return NextResponse.json(
            { success: false, error: "Invalid credentials" },
            { status: 401 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error("Login error:", error.message);
        } else {
            console.error("Login error:", error);
        }
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
