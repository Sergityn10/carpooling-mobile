// YouConnext - User Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar usuario desde AsyncStorage al iniciar
  useEffect(() => {
    loadUser();
  }, []);

  // Cargar usuario almacenado
  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('@youconnext_user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar usuario
  const saveUser = async (userData) => {
    try {
      await AsyncStorage.setItem('@youconnext_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      throw error;
    }
  };

  // Crear usuario (registro)
  const crearUsuario = async (datos) => {
    try {
      const response = await apiService.crearUsuario(datos);
      await saveUser(response.usuario);
      return response;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  };

  // Iniciar sesión (buscar por DNI)
  const iniciarSesion = async (dni) => {
    try {
      const usuario = await apiService.obtenerUsuarioPorDNI(dni);
      await saveUser(usuario);
      return usuario;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('@youconnext_user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  // Actualizar usuario
  const actualizarUsuario = async (datos) => {
    try {
      // Aquí podrías llamar al API para actualizar
      const updatedUser = { ...user, ...datos };
      await saveUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    crearUsuario,
    iniciarSesion,
    cerrarSesion,
    actualizarUsuario,
    refreshUser: loadUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de UserProvider');
  }
  return context;
};

export default UserContext;