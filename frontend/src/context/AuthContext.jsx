import React, { createContext, useContext, useEffect, useState } from "react";
import { login as loginService } from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  /**
   * Iniciar sesión
   */
  const login = async (credenciales) => {
    setLoading(true);

    try {
      const data = await loginService(credenciales);

      /*
        Se espera que el backend responda algo parecido a:

        {
          token: "...",
          user: {
            id: 1,
            nombre: "Usuario",
            email: "correo@correo.com",
            role: "student"
          }
        }
      */

      const newToken = data.token;
      const newUser = data.user;

      if (!newToken) {
        throw new Error(
          "El servidor no devolvió un token de autenticación."
        );
      }

      // Guardar token
      localStorage.setItem("token", newToken);

      // Guardar usuario
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
      }

      // Actualizar estado
      setToken(newToken);
      setUser(newUser || null);

      return data;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  /**
   * Mantener sincronizado el usuario con localStorage
   */
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const isAuthenticated = Boolean(token);

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para utilizar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de un AuthProvider."
    );
  }

  return context;
};

export default AuthContext;
