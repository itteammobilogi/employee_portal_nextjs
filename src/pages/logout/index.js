import { useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    Cookies.remove("token");
    Cookies.remove("role_id");
    router.push("/login");
  }, [router]);

  return <p>Logging out...</p>;
}
