import { createContext, useContext } from "react";

/** Controls the z-index used for portalled autocomplete dropdowns.
 * Wrap form sections with a Provider to scope the z-index:
 *   - review form page: value={49}  (below the header at z-50)
 *   - edit modal:       value={60}  (above the Dialog at z-50)
 * Without a Provider the default 200 is used (existing behaviour). */
export const PortalZIndexContext = createContext<number>(200);
export const usePortalZIndex = () => useContext(PortalZIndexContext);
