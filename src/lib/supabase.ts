import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lanhjtltzxxyhhpwbmqe.supabase.co";
const supabaseKey = "sb_publishable_QQa_onyMKYpcfZEhMOVW9w_h1rlv5Wd";

export const supabase = createClient(supabaseUrl, supabaseKey);
