import { createContext, useContext } from "react";

/**
 * Contexto global de notificaciones.
 * Se define en un archivo aparte (sin componentes) para que el archivo del
 * Provider solo exporte componentes y Fast Refresh (HMR) funcione correctamente.
 */
export const NotificationContext = createContext();

/**
 * Hook para consumir el contexto de notificaciones globales.
 * @returns {{ notification: {message: string, type: string}|null, showNotification: Function, hideNotification: Function }} API del contexto de notificaciones.
 * @throws {Error} Si se usa fuera de un NotificationProvider.
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification debe ser usado dentro de un NotificationProvider"
    );
  }
  return context;
};
