import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [cache, setCache] = useState({});

  const updateCache = (key, data) => {
    setCache(prev => ({ ...prev, [key]: data }));
  };

  const getCachedData = (key) => {
    return cache[key];
  };

  return (
    <DataContext.Provider value={{ getCachedData, updateCache }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataCache = () => useContext(DataContext);
