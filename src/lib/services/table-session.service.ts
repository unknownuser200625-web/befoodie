import { supabase } from "@/lib/supabase";

/**
 * Service to manage table sessions within the operational context of a business day.
 */
export async function getOrCreateTableSession(restaurantId: string, tableId: string) {
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch active operational session for today
    const { data: opsSession, error: opsError } = await supabase
        .from('restaurant_operational_sessions')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('business_date', today)
        .eq('status', 'active')
        .single();

    if (opsError || !opsSession) {
        throw new Error("No active operational session found for today. Restaurant is closed.");
    }

    // 2. Check if a table session already exists for this table in the current operational session
    const { data: existingTableSession, error: tblError } = await supabase
        .from('table_sessions')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('table_id', tableId)
        .eq('operational_session_id', opsSession.id)
        .eq('status', 'open')
        .maybeSingle();

    if (tblError) throw tblError;

    if (existingTableSession) {
        return existingTableSession.id;
    }

    // 3. Create new table session if none exists
    const { data: newTableSession, error: createError } = await supabase
        .from('table_sessions')
        .insert({
            restaurant_id: restaurantId,
            table_id: tableId,
            operational_session_id: opsSession.id,
            status: 'open',
            total_amount: 0
        })
        .select('id')
        .single();

    if (createError) throw createError;
    return newTableSession.id;
}
