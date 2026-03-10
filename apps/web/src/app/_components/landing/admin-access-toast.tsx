"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCustomToast } from "@cooper/ui";

const TOAST_DELAY_MS = 300;
const CLEAR_URL_AFTER_MS = 5000;

const MESSAGE = "You don't have access as an admin or coordinator.";

function AdminAccessToastInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useCustomToast();
  const shownRef = useRef(false);

  const error = searchParams.get("error");
  const showError = error === "unauthorized-admin" || error != null;

  useEffect(() => {
    if (!error || shownRef.current) return;
    shownRef.current = true;

    const showToastId = window.setTimeout(() => {
      toast.error(MESSAGE);
    }, TOAST_DELAY_MS);

    const clearUrlId = window.setTimeout(() => {
      router.replace("/", { scroll: false });
    }, CLEAR_URL_AFTER_MS);

    return () => {
      window.clearTimeout(showToastId);
      window.clearTimeout(clearUrlId);
    };
  }, [error, toast, router]);

  if (!showError) return null;

  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm font-medium mb-4"
    >
      {MESSAGE}
    </div>
  );
}

export function AdminAccessToast() {
  return (
    <Suspense fallback={null}>
      <AdminAccessToastInner />
    </Suspense>
  );
}
