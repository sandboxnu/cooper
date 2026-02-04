export function useCustomToast() {
  const noop = () => {
    /* stub */
  };
  return {
    toast: {
      success: noop,
      error: noop,
      warning: noop,
    },
  };
}
