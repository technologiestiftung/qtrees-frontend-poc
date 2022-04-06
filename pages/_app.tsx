import "../styles/globals.scss";

import { UserContextProvider } from "../lib/UserContext";
import { supabase } from "../utils/init-supabase";
// import "../style.css";
if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
  require("../src/mocks");
}

export default function MyApp({
  Component,
  pageProps,
}: {
  Component: any;
  pageProps: any;
}) {
  return (
    <main>
      <UserContextProvider supabaseClient={supabase}>
        <Component {...pageProps} />
      </UserContextProvider>
    </main>
  );
}
