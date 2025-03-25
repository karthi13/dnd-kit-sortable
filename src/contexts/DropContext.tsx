import { createContext, useContext, useState } from "react";

export interface DropTarget {
  id: string;
  position: "above" | "below";
}

interface DropContextType {
  dropTarget: DropTarget | null;
  setDropTarget: (target: DropTarget | null) => void;
}

// Create Context
const DropContext = createContext<DropContextType | undefined>(undefined);

// Custom Hook
export const useDropContext = () => {
  const context = useContext(DropContext);
  if (!context) {
    throw new Error("useDropContext must be used within a DropProvider");
  }
  return context;
};

// Provider Component
export const DropProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  return (
    <DropContext.Provider value={{ dropTarget, setDropTarget }}>
      {children}
    </DropContext.Provider>
  );
};
