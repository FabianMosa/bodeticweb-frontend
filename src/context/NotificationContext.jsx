import React, { useState, useCallback, useMemo } from "react";
import { NotificationContext } from "./notification-context";

/**
 * Proveedor de notificaciones globales. Expone el estado de la notificación
 * activa y las funciones para mostrarla/ocultarla a toda la aplicación.
 * @param {{ children: React.ReactNode }} props Componentes hijos envueltos por el proveedor.
 * @returns {JSX.Element} Proveedor de contexto de notificaciones.
 */
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
