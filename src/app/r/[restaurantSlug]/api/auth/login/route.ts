import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";
import * as bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;

        // --- TRACE MODE: Task 3 - Raw Payload Integrity ---
        const rawJson = await req.json();
        console.log(`[TRACE] RAW REQUEST BODY: ${JSON.stringify(rawJson)}`);

        const { role, password, pin } = rawJson;

        // --- TRACE MODE: Task 2 - Slug Routing ---
        console.log(`[TRACE] Received Slug: "${restaurantSlug}"`);
        console.log(`[TRACE] Password Provided: ${password ? 'YES (Length: ' + password.length + ')' : 'NO'}`);
        console.log(`[TRACE] PIN Provided: ${pin ? 'YES (Length: ' + pin.length + ')' : 'NO'}`);

        // Fetch restaurant details for authentication info
        const { data: restaurant, error: fetchError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('slug', restaurantSlug)
            .single();

        if (fetchError || !restaurant) {
            console.log(`[TRACE] FAILED: Restaurant NOT FOUND for slug: "${restaurantSlug}"`);
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        console.log(`[TRACE] RESOLVED restaurant_id: ${restaurant.id}`);
        console.log(`[TRACE] Attempting login for role: ${role}`);

        let authenticatedRole = "";

        if (role === "owner") {
            const storedHash = restaurant.owner_password_hash || "";
            console.log(`[TRACE] Comparing Owner Password against hash: ${storedHash.substring(0, 10)}...`);
            const isValid = await bcrypt.compare(password, storedHash);
            console.log(`[TRACE] RESULT: ${isValid ? 'MATCH FOUND' : 'MISMATCH'}`);
            if (isValid) {
                authenticatedRole = "owner";
            }
        } else if (role === "staff") {
            const storedHash = restaurant.staff_pin_hash || "";
            console.log(`[TRACE] Comparing Staff PIN against hash: ${storedHash.substring(0, 10)}...`);
            const isValid = await bcrypt.compare(pin, storedHash);
            console.log(`[TRACE] RESULT: ${isValid ? 'MATCH FOUND' : 'MISMATCH'}`);
            if (isValid) {
                authenticatedRole = "staff";
            }
        }

        if (authenticatedRole) {
            // JWT includes restaurant info for multi-tenancy
            const token = jwt.sign(
                {
                    role: authenticatedRole,
                    restaurantId: restaurant.id,
                    restaurantSlug: restaurant.slug
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
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
