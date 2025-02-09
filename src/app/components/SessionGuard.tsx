"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionGuard({
  session,
  children,
}: {
  session: any;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.replace("/login"); // 🔄 Use replace to avoid back button issues
    }
  }, [session, router]);

console.log("<<session",session)

  return <>{children}</>;
}
