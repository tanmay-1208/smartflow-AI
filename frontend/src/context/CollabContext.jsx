import { createContext, useContext } from "react";
import { useCollaboration } from "../hooks/useCollaboration";

const CollabContext = createContext(null);

export function CollabProvider({ children }) {
  const collab = useCollaboration();
  return (
    <CollabContext.Provider value={collab}>
      {children}
    </CollabContext.Provider>
  );
}

export const useCollab = () => useContext(CollabContext);
