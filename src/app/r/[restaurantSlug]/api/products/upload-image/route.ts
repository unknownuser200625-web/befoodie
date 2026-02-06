import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// Force Node.js runtime for Buffer support
export const runtime = 'nodejs';

// Initialize Supabase client with service role for storage operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;

        console.log('[IMAGE-UPLOAD] Starting upload for restaurant:', restaurantSlug);

        // Get restaurant ID
        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            console.error('[IMAGE-UPLOAD] Restaurant not found:', resError);
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const formData = await request.formData();
        const image = formData.get('image') as File;

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // Validate file type
        if (!image.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Validate file size (5MB max)
        if (image.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image must be less than 5MB' }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = image.name.split('.').pop();
        const filename = `${restaurant.id}/${timestamp}.${ext}`;

        console.log('[IMAGE-UPLOAD] Uploading file:', filename);

        // Convert File to ArrayBuffer then to Buffer
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('product-images')
            .upload(filename, buffer, {
                contentType: image.type,
                upsert: false
            });

        if (uploadError) {
            console.error('[IMAGE-UPLOAD] Upload error:', uploadError);
            return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(filename);

        console.log('[IMAGE-UPLOAD] Upload successful:', urlData.publicUrl);

        return NextResponse.json({ imageUrl: urlData.publicUrl });
    } catch (error) {
        console.error('[IMAGE-UPLOAD] Critical error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
