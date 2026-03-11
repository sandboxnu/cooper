"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCustomToast } from "@cooper/ui";

const CLEAR_URL_AFTER_MS = 5000;

const MESSAGE = "You don't have access as an admin or coordinator.";

function AdminAccessToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useCustomToast();
  const shownRef = useRef(false);

  const error = searchParams.get("error");
  console.log("[AdminAccessToast] render", { error });

  useEffect(() => {
    if (!error || shownRef.current) return;
    shownRef.current = true;
    console.log("[AdminAccessToast] scheduling toast", { error });

    console.log("[AdminAccessToast] showing toast", { error });
    toast.error(MESSAGE);

    const clearUrlId = window.setTimeout(() => {
      console.log("[AdminAccessToast] clearing url", { error });
      router.replace("/", { scroll: false });
    }, CLEAR_URL_AFTER_MS);

    return () => {
      console.log("[AdminAccessToast] cleanup", { error });
      window.clearTimeout(clearUrlId);
    };
    // Intentionally depend only on `error`.
    // `toast` is not referentially stable (new object each render) and would cancel the timeout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return null;
}

export function AdminAccessToast() {
  return (
    <Suspense fallback={null}>
      <AdminAccessToastInner />
    </Suspense>
  );
}
