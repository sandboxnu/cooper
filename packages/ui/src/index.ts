import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof cx>) => twMerge(cx(inputs));

export { cn };

export { CustomToaster } from "./custom-toaster";
export { useCustomToast } from "./hooks/use-custom-toast";
export { SuccessToast } from "./success-toast";
export { ErrorToast } from "./error-toast";
export { Pagination } from "./pagination";
