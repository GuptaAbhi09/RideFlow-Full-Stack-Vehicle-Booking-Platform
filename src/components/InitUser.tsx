"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useGetMe } from "@/hooks/useGetMe";

export function InitUser({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { fetchUser } = useGetMe();

  useEffect(() => {
    if (status === "authenticated") {
      fetchUser();
    }
  }, [status, fetchUser]);

  return <>{children}</>;
}
