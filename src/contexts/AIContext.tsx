import React, { createContext, useContext, useState } from "react";

interface AIContextType {
  currentData: any;
  broadcastData: (data: any) => void;
}

const AIContext = createContext<AIContextType>({
  currentData: null,
  broadcastData: () => {},
});

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentData, setCurrentData] = useState<any>(null);

  const broadcastData = (data: any) => {
    // Previne loops de renderização
    if (JSON.stringify(data) !== JSON.stringify(currentData)) {
      setCurrentData(data);
    }
  };

  return (
    <AIContext.Provider value={{ currentData, broadcastData }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);
