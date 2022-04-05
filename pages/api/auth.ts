/**
 * NOTE: this file is only needed if you're doing SSR (getServerSideProps)!
 */
import { supabase } from "../../utils/init-supabase";

export default function handler(req: any, res: any) {
  supabase.auth.api.setAuthCookie(req, res);
}
