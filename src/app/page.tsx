import { redirect } from "next/navigation";

// The home address sends everyone to the login page.
export default function Home() {
  redirect("/login");
}
