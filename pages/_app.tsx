import "../styles/globals.css";
import { UserContextProvider } from "../lib/UserContext";
import { supabase } from "../utils/init-supabase";
// import "../style.css";

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
