import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, slug, email, password, pin, food_policy } = body; // email is for future use/record

        if (!name || !slug || !password || !pin || !food_policy) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate food_policy
        if (!['PURE_VEG', 'PURE_NON_VEG', 'MIXED'].includes(food_policy)) {
            return NextResponse.json({ error: "Invalid food policy" }, { status: 400 });
        }

        // 1. Check uniqueness of slug
        const { data: existing } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', slug)
            .single();

        if (existing) {
            return NextResponse.json({ error: "Restaurant slug already taken" }, { status: 409 });
        }

        // 3. Create Restaurant
        console.log(`[ONBOARDING] Creating restaurant: ${name} (${slug})`);
        console.log(`[ONBOARDING] Hashing credentials...`);

        // 2. Hash credentials
        const ownerPasswordHash = await bcrypt.hash(password, 10);
        const staffPinHash = await bcrypt.hash(pin, 10);

        console.log(`[ONBOARDING] ownerPasswordHash length: ${ownerPasswordHash.length}`);
        console.log(`[ONBOARDING] staffPinHash length: ${staffPinHash.length}`);

        const { data: restaurant, error: createError } = await supabase
            .from('restaurants')
            .insert({
                slug,
                name,
                owner_password_hash: ownerPasswordHash,
                staff_pin_hash: staffPinHash,
                food_policy,
                // created_at is default
            })
            .select()
            .single();

        if (createError || !restaurant) {
            console.error("Create restaurant error:", createError);
            return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 });
        }

        const restaurantId = restaurant.id;

        // 4. Auto-seed Tables (1-10)
        const tables = Array.from({ length: 10 }, (_, i) => ({
            restaurant_id: restaurantId,
            table_number: (i + 1).toString()
        }));

        const { error: tablesError } = await supabase
            .from('tables')
            .insert(tables);

        if (tablesError) console.error("Auto-seed tables error:", tablesError);

        // 5. Auto-seed Categories (Defaults)
        const defaultCategories = [
            { name: "Starters", order_index: 0 },
            { name: "Mains", order_index: 1 },
            { name: "Beverages", order_index: 2 },
            { name: "Desserts", order_index: 3 }
        ];

        const categoriesPayload = defaultCategories.map(cat => ({
            restaurant_id: restaurantId,
            name: cat.name,
            order_index: cat.order_index
        }));

        const { error: catError } = await supabase
            .from('categories')
            .insert(categoriesPayload);

        if (catError) console.error("Auto-seed categories error:", catError);

        return NextResponse.json({
            success: true,
            restaurant: {
                id: restaurant.id,
                slug: restaurant.slug,
                name: restaurant.name
            },
            message: "Restaurant created successfully with default setup."
        });

    } catch (error) {
        if (error instanceof Error) {
            console.error("Onboarding error:", error.message);
            return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
        } else {
            console.error("Onboarding error:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }
}
