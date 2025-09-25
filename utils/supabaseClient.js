import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || "https://dixixhivrqlezdopvlan.supabase.co";
const supabaseKey =
  process.env.SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeGl4aGl2cnFsZXpkb3B2bGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjk4NjAsImV4cCI6MjA3Mzg0NTg2MH0.CVMxjx0AUYfAHQo2kJvaQ9M-U_cvYAGILAUYlL-2QNI";

export const supabase = createClient(supabaseUrl, supabaseKey);
