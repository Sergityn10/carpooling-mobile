// YouConnext - User Context
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import httpClient from "../services/httpClient";
import travelsHttpClient from "../services/travels/httpClient";
import authService from "../services/authService";
import usuarioService from "../services/usuarioService";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar usuario desde AsyncStorage al iniciar
  useEffect(() => {
    loadUser();
  }, []);

  // Registrar handler de 401: limpiar sesión y redirigir a login
  useEffect(() => {
    const handleUnauthorized = () => {
      clearStoredSession();
    };
    httpClient.setUnauthorizedHandler(handleUnauthorized);
    travelsHttpClient.setUnauthorizedHandler(handleUnauthorized);
    return () => {
      httpClient.setUnauthorizedHandler(null);
      travelsHttpClient.setUnauthorizedHandler(null);
    };
  }, []);

  // Cargar usuario almacenado
  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("@youconnext_token");

      if (token) {
        httpClient.setToken(token);
        travelsHttpClient.setToken(token);
        try {
          // Validar token y obtener datos del usuario
          const validateRes = await authService.validateToken();
          const userData = validateRes.data || validateRes;

          // Obtener info completa del usuario
          try {
            const infoRes = await usuarioService.getUserInfo();
            const fullUser = {
              id: userData.userId,
              email: userData.email,
              img_perfil: userData.img_perfil,
              ciudad: userData.ciudad,
              onboarding_ended: userData.onboarding_ended,
              role: userData.role,
              ...(infoRes.data || infoRes),
            };
            setUser(fullUser);
            setIsAuthenticated(true);
          } catch {
            // Si getUserInfo falla, usar datos de validateToken
            setUser({
              id: userData.userId,
              email: userData.email,
              img_perfil: userData.img_perfil,
              ciudad: userData.ciudad,
              onboarding_ended: userData.onboarding_ended,
              role: userData.role,
            });
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Error al validar token:", error);
          await clearStoredSession();
        }
      } else {
        // Fallback: cargar usuario guardado localmente
        const userData = await AsyncStorage.getItem("@youconnext_user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar sesión (token + usuario)
  const saveSession = async (userData, token) => {
    try {
      await AsyncStorage.setItem("@youconnext_user", JSON.stringify(userData));
      if (token) {
        await AsyncStorage.setItem("@youconnext_token", token);
        httpClient.setToken(token);
        travelsHttpClient.setToken(token);
      }
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error al guardar sesión:", error);
      throw error;
    }
  };

  // Limpiar sesión almacenada
  const clearStoredSession = async () => {
    await AsyncStorage.removeItem("@youconnext_user");
    await AsyncStorage.removeItem("@youconnext_token");
    httpClient.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Crear usuario (registro) — solo email + password
  const crearUsuario = async (email, password) => {
    try {
      const response = await authService.register(email, password);
      const token = response.token;
      httpClient.setToken(token);
      travelsHttpClient.setToken(token);
      // Tras registro, obtener info completa del usuario
      let userData = {
        id: response.userId,
        email,
        onboarding_ended: 0,
      };

      try {
        const infoRes = await usuarioService.getUserInfo();
        userData = { ...userData, ...(infoRes.data || infoRes) };
      } catch {
        // Si falla, usar datos básicos del registro
      }

      await saveSession(userData, token);
      return { ...response, user: userData };
    } catch (error) {
      console.error("Error al crear usuario:", error);
      throw error;
    }
  };

  // Iniciar sesión (email + password)
  const iniciarSesion = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const token = response.token;
      httpClient.setToken(token);
      travelsHttpClient.setToken(token);
      // Construir userData con lo que devuelve login + validateToken
      let userData = {
        id: response.userId,
        email,
        img_perfil: response.img_perfil,
        onboarding_ended: response.onboarding_ended,
      };

      // Obtener info completa del usuario
      try {
        const infoRes = await usuarioService.getUserInfo();
        userData = { ...userData, ...(infoRes.data || infoRes) };
      } catch {
        // Si falla, usar datos básicos del login
      }

      await saveSession(userData, token);
      return { ...response, user: userData };
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw error;
    }
  };

  // Cerrar sesión
  const cerrarSesion = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión en API:", error);
    } finally {
      // Cerrar sesión también en el SDK nativo de Google
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignorar si no hay sesión de Google
      }
      await clearStoredSession();
    }
  };

  // Login con Google nativo — recibe idToken del SDK de Google Sign-In
  const loginGoogleNative = async (idToken, method = "login") => {
    try {
      const res = await authService.loginWithGoogleAndroid(idToken, method);
      const { token, userId, img_perfil } = res;

      httpClient.setToken(token);
      travelsHttpClient.setToken(token);
      let userData = {
        id: userId,
        img_perfil: img_perfil || null,
        onboarding_ended: res.onboarding_ended,
      };

      // Obtener info completa del usuario
      try {
        const infoRes = await usuarioService.getUserInfo();
        userData = { ...userData, ...(infoRes.data || infoRes) };
      } catch {
        // Si falla, usar datos básicos del login
      }

      await saveSession(userData, token);
      return { token, userId, user: userData };
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  // Actualizar usuario (PATCH /api/users)
  const actualizarUsuario = async (datos) => {
    try {
      await usuarioService.updateUser(datos);

      // Tras actualizar, refrescar datos del usuario
      try {
        const infoRes = await usuarioService.getUserInfo();
        const updatedUser = {
          ...user,
          ...datos,
          ...(infoRes.data || infoRes),
        };
        await AsyncStorage.setItem(
          "@youconnext_user",
          JSON.stringify(updatedUser),
        );
        setUser(updatedUser);
        return updatedUser;
      } catch {
        // Si no se puede refrescar, actualizar localmente
        const updatedUser = { ...user, ...datos };
        await AsyncStorage.setItem(
          "@youconnext_user",
          JSON.stringify(updatedUser),
        );
        setUser(updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    crearUsuario,
    iniciarSesion,
    loginGoogleNative,
    cerrarSesion,
    actualizarUsuario,
    refreshUser: loadUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe ser usado dentro de UserProvider");
  }
  return context;
};

export default UserContext;
