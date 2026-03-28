var _a, _b;
// CDN ESM — resolved at runtime in the browser
// @ts-expect-error remote module URL
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabaseUrl = (_a = window.SUPABASE_URL) !== null && _a !== void 0 ? _a : "";
const supabaseKey = (_b = window.SUPABASE_ANON_KEY) !== null && _b !== void 0 ? _b : "";
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase config. Set window.SUPABASE_URL and window.SUPABASE_ANON_KEY in index.html.");
}
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
