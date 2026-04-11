import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

// 1. Crear el Contexto
const NotificationContext = createContext();

// 2. Crear el "Proveedor" que manejará el estado
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null); // Ej: { message: 'Hola', type: 'success' }

  // Referencias estables: evitan que useEffect en páginas (p. ej. Inventario) se dispare en bucle
  const showNotification = useCallback((message, type = "error") => {
    setNotification({ message, type });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const value = useMemo(
    () => ({ notification, showNotification, hideNotification }),
    [notification, showNotification, hideNotification],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// 3. Crear un "Hook" personalizado para que sea fácil de usar
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification debe ser usado dentro de un NotificationProvider"
    );
  }
  return context;
};
