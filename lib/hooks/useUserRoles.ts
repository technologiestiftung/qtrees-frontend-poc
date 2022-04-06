import { PostgrestError } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/init-supabase";
export interface UserRole {
  user_id: string;
  id: number;
  role: "viewer" | "editor" | "admin";
}
export function useUserRole(userId: string | undefined) {
  const [userRoles, setUserRoles] = useState<UserRole | null>(null);
  const [userRolesError, setUserRolesError] = useState<PostgrestError | null>(
    null
  );
  useEffect(() => {
    if (userId === undefined) {
      return;
    }
    supabase
      .from<UserRole>("user_roles")
      .select("*")
      .eq("user_id", userId)
      .then((res) => {
        const { data, error } = res;
        if (data) setUserRoles(data[0]);
        if (error) setUserRolesError(error);
      });
  }, [userId]);
  return { userRoles, userRolesError };
}
