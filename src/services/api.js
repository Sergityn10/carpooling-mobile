// YouConnext - API Service
import { API_CONFIG, VIAJE_ESTADO } from "../constants";

import { NativeModules, Platform } from "react-native";

const getMetroHost = () => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (typeof scriptURL !== "string") return null;
  const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?\//);
  return match?.[1] || null;
};

class ApiService {
  constructor() {
    const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    let baseUrl = envBaseUrl || API_CONFIG.BASE_URL;

    if (!envBaseUrl && Platform.OS === "android") {
      if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1")) {
        const metroHost = getMetroHost();
        const host = metroHost || "10.0.2.2";
        baseUrl = baseUrl
          .replace("http://localhost", `http://${host}`)
          .replace("http://127.0.0.1", `http://${host}`);
      }
    }

    this.baseUrl = baseUrl;

    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log("API baseUrl:", this.baseUrl);
    }
  }

  // Helper para hacer requests
  async request(endpoint, options = {}) {
    const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    if (envBaseUrl) {
      this.baseUrl = envBaseUrl;
    } else if (Platform.OS === "android") {
      const metroHost = getMetroHost();
      const host = metroHost || "10.0.2.2";

      const nextBaseUrl = this.baseUrl
        .replace("http://localhost", `http://${host}`)
        .replace("http://127.0.0.1", `http://${host}`)
        .replace("http://10.0.2.2", `http://${host}`)
        .replace("http://192.168.0.47", `http://${host}`);

      if (nextBaseUrl !== this.baseUrl) {
        this.baseUrl = nextBaseUrl;
        if (typeof __DEV__ !== "undefined" && __DEV__) {
          console.log("API baseUrl (updated):", this.baseUrl);
        }
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    const hasBody = options.body !== undefined && options.body !== null;
    const headers = {
      ...options.headers,
    };

    if (hasBody) {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    } else {
      if (headers["Content-Type"] === "application/json") {
        delete headers["Content-Type"];
      }
    }

    const config = {
      ...options,
      headers,
    };

    if (!hasBody) {
      delete config.body;
    } else if (
      headers["Content-Type"]?.includes("application/json") &&
      typeof config.body !== "string"
    ) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      const rawText = await response.text();
      let data = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = rawText;
        }
      }

      if (!response.ok) {
        if (data && typeof data === "object") {
          throw new Error(data.error || "Error en la petición");
        }
        throw new Error(
          typeof data === "string" && data ? data : "Error en la petición",
        );
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // ==================== USUARIOS ====================

  // Crear usuario
  async crearUsuario(datos) {
    return this.request("/api/usuarios", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  }

  // Obtener usuario por DNI
  async obtenerUsuarioPorDNI(dni) {
    return this.request(`/api/usuarios/dni/${dni}`);
  }

  // Listar usuarios
  async listarUsuarios() {
    return this.request("/api/usuarios");
  }

  // ==================== VIAJES ====================

  // Crear viaje rápido
  async crearViaje(datos) {
    return this.request("/api/viajes", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  }

  // Obtener viaje por ID
  async obtenerViaje(id) {
    return this.request(`/api/viajes/${id}`);
  }

  // Obtener viaje por código QR
  async obtenerViajePorQR(codigo) {
    return this.request(`/api/viajes/qr/${codigo}`);
  }

  // Unirse a un viaje
  async unirseViaje(codigoQR, pasajeroDNI) {
    return this.request("/api/viajes/unirse", {
      method: "POST",
      body: JSON.stringify({ codigoQR, pasajeroDNI }),
    });
  }

  // Iniciar viaje
  async iniciarViaje(id) {
    return this.request(`/api/viajes/${id}/iniciar`, {
      method: "PUT",
    });
  }

  // Completar viaje
  async completarViaje(id, distanciaKm) {
    return this.request(`/api/viajes/${id}/completar`, {
      method: "PUT",
      body: JSON.stringify({ distanciaKm }),
    });
  }

  // Cancelar viaje
  async cancelarViaje(id) {
    return this.request(`/api/viajes/${id}/cancelar`, {
      method: "PUT",
    });
  }

  // Listar viajes activos
  async listarViajesActivos() {
    return this.request("/api/viajes/activos");
  }

  // Listar todos los viajes
  async listarViajes() {
    return this.request("/api/viajes");
  }

  // Obtener historial de usuario
  async obtenerHistorialUsuario(dni) {
    return this.request(`/api/viajes/historial/${dni}`);
  }

  // ==================== UBICACIONES ====================

  // Registrar ubicación
  async registrarUbicacion(datos) {
    return this.request("/api/ubicaciones", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  }

  // Registrar ubicaciones en batch
  async registrarUbicacionesBatch(ubicaciones) {
    return this.request("/api/ubicaciones/batch", {
      method: "POST",
      body: JSON.stringify({ ubicaciones }),
    });
  }

  // Obtener ubicaciones de un viaje
  async obtenerUbicacionesViaje(viajeId) {
    return this.request(`/api/ubicaciones/viaje/${viajeId}`);
  }

  // Obtener última ubicación
  async obtenerUltimaUbicacion(viajeId) {
    return this.request(`/api/ubicaciones/viaje/${viajeId}/ultima`);
  }

  // Calcular distancia
  async calcularDistancia(viajeId) {
    return this.request(`/api/ubicaciones/viaje/${viajeId}/distancia`);
  }

  // ==================== HELPERS ====================

  // Verificar si el backend está disponible
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
