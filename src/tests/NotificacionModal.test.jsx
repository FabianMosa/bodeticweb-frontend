/**
 * Pruebas de UI Componentes Medios - Modal de Notificaciones (Frontend)
 * 
 * Este test verifica la lógica condicional del componente global de alertas.
 * Comprueba que responda adecuadamente a los cambios de estado en el NotificationContext
 * sin depender de si la llamada original provino de un error en Login o Inventario.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import NotificationModal from '../components/NotificacionModal';

// Mock del hook useNotification para forzar los estados locales de éxito y error
import * as NotificationContext from '../context/NotificationContext';

describe('NotificationModal Crítico (Comportamiento UX Medio)', () => {
  test('No debe renderizar nada (devuelve null) si no hay notificaciones activas', () => {
    // 1. Arrange: Forzamos estado vacío en el contexto
    vi.spyOn(NotificationContext, 'useNotification').mockReturnValue({
      notification: null,
      hideNotification: vi.fn(),
    });

    const { container } = render(<NotificationModal />);
    
    // 2. Assert: Comprobamos que el DOM del componente esté vacío
    expect(container).toBeEmptyDOMElement();
  });

  test('Debe renderizar alerta de Error (danger) con los textos adecuados y disparar el cierre', () => {
    // 1. Arrange: Configuramos un espía mock para detectar el click y fingimos un error grave
    const mockHide = vi.fn();
    vi.spyOn(NotificationContext, 'useNotification').mockReturnValue({
      notification: { type: 'error', message: 'Credenciales inválidas' },
      hideNotification: mockHide,
    });

    render(<NotificationModal />);

    // 2. Assert: Validamos presencia visual de elementos críticos
    expect(screen.getByText('¡Atención!')).toBeInTheDocument();
    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    
    // 3. Act: Simulamos click en "Entendido"
    const botonCerrar = screen.getByRole('button', { name: /Entendido/i });
    fireEvent.click(botonCerrar);

    // 4. Assert Secundario: Aseguramos que el componente despache correctamente la acción de limpiar el contexto
    expect(mockHide).toHaveBeenCalledTimes(1);
  });

  test('Debe renderizar alerta de Éxito (success)', () => {
    // 1. Arrange: Reconfiguramos contexto a éxito
    vi.spyOn(NotificationContext, 'useNotification').mockReturnValue({
      notification: { type: 'success', message: 'Insumo creado' },
      hideNotification: vi.fn(),
    });

    render(<NotificationModal />);

    // 2. Assert: Comprobamos que aplican los mapeos UX positivos
    expect(screen.getByText('¡Operación Exitosa!')).toBeInTheDocument();
    expect(screen.getByText('Insumo creado')).toBeInTheDocument();
  });
});
