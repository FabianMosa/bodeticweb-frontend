/**
 * Pruebas de UI Críticas - Página de Autenticación (Frontend)
 * 
 * Este conjunto de pruebas valida que la capa visual más crítica del usuario
 * (la pantalla de login) cargue correctamente sus elementos e interactúe
 * con el estado sin depender de una API real.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import LoginPage from '../pages/LoginPage';
import { NotificationProvider } from '../context/NotificationContext';

// Mock de Servicios: Evitamos que el componente intercepte Axios e intente llamar al backend real.
// Reemplazamos authService por una función espía (vi.fn) que vitest puede observar.
vi.mock('../services/auth.services', () => ({
  default: {
    login: vi.fn(),
  }
}));

describe('LoginPage Crítico', () => {
  test('Debería renderizar la pantalla de Login y contener campos vitales', () => {
    // 1. Arrange: Montamos el componente empaquetándolo en sus dependencias vitales de Contexto y Enrutamiento virtual.
    render(
      <MemoryRouter>
        <NotificationProvider>
          <LoginPage />
        </NotificationProvider>
      </MemoryRouter>
    );

    // 2. Assert: Comprobamos renderizado de marcas y placeholders
    expect(screen.getByText('BodegaWeb')).toBeInTheDocument(); // Logo/Branding
    expect(screen.getByPlaceholderText('Ej: 12.345.678-9')).toBeInTheDocument(); // Input de Usuario
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toBeInTheDocument(); // Input de Contraseña
    
    // Verificamos que el Call To Action exista y sea accesible
    const boton = screen.getByRole('button', { name: /Ingresar al Sistema/i });
    expect(boton).toBeInTheDocument();
  });

  test('Debería actualizar y formatear automáticamente el RUT al tipear', () => {
    // 1. Arrange: Renderizamos de nuevo el entorno aislado
    render(
      <MemoryRouter>
        <NotificationProvider>
          <LoginPage />
        </NotificationProvider>
      </MemoryRouter>
    );

    // 2. Act: Simulamos que el usuario teclea números "en bruto" dentro del campo RUT
    const inputRut = screen.getByPlaceholderText('Ej: 12.345.678-9');
    fireEvent.change(inputRut, { target: { value: '111111111' } });
    
    // 3. Assert: Comprobamos si la lógica UX en LoginPage.jsx interceptó el valor y lo formateó (agregó puntos y guion)
    expect(inputRut.value).toBe('11.111.111-1');
  });
});
