
import React, { createContext, useContext, useState } from 'react';

// 1. Crear el Contexto
const NotificationContext = createContext();

// 2. Crear el "Proveedor" que manejará el estado
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null); // Ej: { message: 'Hola', type: 'success' }

  // Función para MOSTRAR la notificación
  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
  };

  // Función para OCULTAR la notificación
  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// 3. Crear un "Hook" personalizado para que sea fácil de usar
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
  }
  return context;
};