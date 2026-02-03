import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    const { restaurantSlug: currentSlug } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    let authenticated = false;
    let role = null;
    let decodedRestaurantId = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {
                role: string;
                restaurantId: string;
                restaurantSlug: string;
            };

            // Critical check: Ensure the token belongs to the restaurant being accessed
            if (decoded.restaurantSlug === currentSlug) {
                authenticated = true;
                role = decoded.role;
                decodedRestaurantId = decoded.restaurantId;
            }
        } catch (e) {
            // Invalid token
        }
    }

    // Check if system is open for this restaurant
    let isSystemOpen = false;
    if (decodedRestaurantId) {
        // This will eventually check a 'sessions' table or restaurant status in Supabase
        isSystemOpen = true;
    }

    return NextResponse.json({
        authenticated,
        role,
        isSystemOpen
    });
}
