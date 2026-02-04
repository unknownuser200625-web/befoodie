import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabase";
import * as bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

type DecodedToken = {
    role: string;
    restaurantId: string;
    restaurantSlug: string;
};

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;

        // 1. Verify Auth
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let user: DecodedToken;
        try {
            user = jwt.verify(token, JWT_SECRET) as DecodedToken;
        } catch (e) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        if (user.role !== 'owner' || user.restaurantSlug !== restaurantSlug) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Process Request
        const body = await req.json();
        const { type, oldPassword, newPassword, newPin } = body;

        // Fetch current hashes
        const { data: restaurant, error: fetchError } = await supabase
            .from('restaurants')
            .select('owner_password_hash')
            .eq('id', user.restaurantId)
            .single();

        if (fetchError || !restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        const updates: any = {};

        if (type === 'password') {
            if (!oldPassword || !newPassword) {
                return NextResponse.json({ error: "Missing fields" }, { status: 400 });
            }

            // Verify old password
            const isValid = await bcrypt.compare(oldPassword, restaurant.owner_password_hash);
            if (!isValid) {
                return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
            }

            // Hash new password
            updates.owner_password_hash = await bcrypt.hash(newPassword, 10);
        }
        else if (type === 'pin') {
            if (!newPin || newPin.length < 4) {
                return NextResponse.json({ error: "Invalid PIN format" }, { status: 400 });
            }
            // Hash new PIN
            updates.staff_pin_hash = await bcrypt.hash(newPin, 10);
        } else {
            return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
        }

        // 3. Update Database
        const { error: updateError } = await supabase
            .from('restaurants')
            .update(updates)
            .eq('id', user.restaurantId);

        if (updateError) {
            console.error("Update error:", updateError);
            return NextResponse.json({ error: "Failed to update security settings" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Security settings updated successfully" });

    } catch (error: any) {
        console.error("Security API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
