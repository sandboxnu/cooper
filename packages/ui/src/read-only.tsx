import { createContext, useContext } from "react";

// True while a form is shown read-only (e.g. a review in view mode). Inputs
// hide their edit-only controls: clear/remove X's, empty pickers, add buttons.
export const ReadOnlyContext = createContext(false);

export function useReadOnly() {
  return useContext(ReadOnlyContext);
}
