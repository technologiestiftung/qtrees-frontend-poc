import Link from "next/link";
import useSWR from "swr";
import { supabase } from "../utils/init-supabase";
import { useEffect, useState } from "react";
import Auth from "./../components/Auth";
import { useUser } from "../lib/UserContext";

import { useUserRole } from "../lib/hooks/useUserRoles";

const fetcher = (url: string, token: string) =>
  fetch(url, {
    method: "GET",
    headers: new Headers({ "Content-Type": "application/json", token }),
    credentials: "same-origin",
  }).then((res) => res.json());

const poster = (url: string, token: string, body: any) =>
  fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
  }).then((res) => res.json());

const Index = () => {
  const { user, session } = useUser();
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const { userRoles, userRolesError } = useUserRole(userId);

  const [apiData, setApiData] = useState({});
  const { data, error } = useSWR(
    session ? ["/api/getUser", session.access_token] : null,
    fetcher
  );

  const [authView, setAuthView] = useState("sign_in");
  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") setAuthView("update_password");
        if (event === "USER_UPDATED")
          setTimeout(() => setAuthView("sign_in"), 1000);
        // Send session to /api/auth route to set the auth cookie.
        // NOTE: this is only needed if you're doing SSR (getServerSideProps)!
        fetch("/api/auth", {
          method: "POST",
          headers: new Headers({ "Content-Type": "application/json" }),
          credentials: "same-origin",
          body: JSON.stringify({ event, session }),
        }).then((res) => res.json());
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const View = () => {
    if (!user)
      return (
        <>
          <div>
            <img
              src="https://app.supabase.io/img/supabase-dark.svg"
              width="96"
            />
            <h2>
              Supabase Auth <br />
              with NextJS SSR
            </h2>
          </div>
          <Auth
            supabaseClient={supabase}
            authView={authView}
            setAuthView={setAuthView}
          />
        </>
      );

    return (
      <>
        {authView === "update_password" && (
          <Auth.UpdatePassword supabaseClient={supabase} />
        )}
        {user && (
          <>
            <h4>{"You're signed in"}</h4>
            <h5>Email: {user.email}</h5>
            <button onClick={() => supabase.auth.signOut()}>Log out</button>
            <hr />
            {error && <div style={{ color: "red" }}>Failed to fetch user!</div>}
            {data && !error ? (
              <>
                <div style={{ color: "green" }}>
                  User data retrieved server-side (in API route):
                </div>

                <pre>{JSON.stringify(data, null, 2)}</pre>
              </>
            ) : (
              <div>Loading...</div>
            )}
            <hr />
            {userRolesError && (
              <>
                {"User Roles Error"}
                <pre>{JSON.stringify(userRolesError)}</pre>
              </>
            )}
            <h4>User Role</h4>
            {userRoles && (
              <>
                <pre>{JSON.stringify(userRoles, null, 2)}</pre>
              </>
            )}
            <hr />
            <h4>
              Make requests based on your user role (e.g. only admin and editor
              are allowed)
            </h4>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (!session) return;
                poster(
                  `${process.env.NEXT_PUBLIC_TREES_API_URL}/trees/1`,
                  session.access_token,
                  {
                    message: "Hello from the client!",
                  }
                ).then((res) => {
                  console.log(res);
                  setApiData(res);
                });
              }}
            >
              POST
            </button>
            {apiData && <pre>{JSON.stringify(apiData, null, 2)}</pre>}
            <Link href="/profile">
              <a>SSR example with getServerSideProps</a>
            </Link>
            <Link href="/trees">See the trees overview</Link>
          </>
        )}
      </>
    );
  };

  return (
    <div style={{ maxWidth: "520px", margin: "96px auto" }}>
      <View />
    </div>
  );
};

export default Index;
