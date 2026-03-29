// CDN ESM — resolved at runtime in the browser
// @ts-expect-error remote module URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare global {
    interface Window {
        SUPABASE_URL?: string;
        SUPABASE_ANON_KEY?: string;
    }
}

const supabaseUrl = window.SUPABASE_URL ?? "";
const supabaseKey = window.SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseKey) {
    console.error(
        "Missing Supabase config. Set window.SUPABASE_URL and window.SUPABASE_ANON_KEY in index.html.",
    );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
