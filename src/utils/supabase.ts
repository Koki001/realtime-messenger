import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_URL;
const key = process.env.NEXT_PUBLIC_KEY;

if (!url || !key) {
  throw new Error("URL OR KEY WRONG TYPE");
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
  },
});

export default supabase;
