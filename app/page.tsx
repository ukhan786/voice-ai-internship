import { redirect } from "next/navigation";

// The middleware handles auth; authenticated users land on the dashboard,
// everyone else is redirected to /login.
export default function Home() {
  redirect("/dashboard");
}
