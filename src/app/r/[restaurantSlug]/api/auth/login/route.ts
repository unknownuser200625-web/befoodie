import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        const body = await req.json();
        const { role, password, pin } = body;

        // Fetch restaurant details for authentication info
        const { data: restaurant, error: fetchError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('slug', restaurantSlug)
            .single();

        if (fetchError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        let authenticatedRole = "";

        if (role === "owner") {
            // Using placeholder logic since hashes aren't implemented yet, but we check against restaurant data
            if (password === restaurant.owner_password_hash || password === process.env.OWNER_PASSWORD) {
                authenticatedRole = "owner";
            }
        } else if (role === "staff") {
            if (pin === restaurant.staff_pin_hash || pin === process.env.KITCHEN_PIN) {
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
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
