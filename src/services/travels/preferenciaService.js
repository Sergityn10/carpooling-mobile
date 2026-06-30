// YouConnext - Preferencia Service (api-travels)
import httpClient from "./httpClient";

// Obtener definiciones de preferencias — GET /api/preferences/definitions
async function obtenerDefiniciones() {
  return httpClient.request("/api/preferences/definitions");
}

// Insertar preferencias por defecto — POST /api/users/:userId/preferences/default
async function insertarPreferenciasPorDefecto(userId) {
  return httpClient.request(`/api/users/${userId}/preferences/default`, {
    method: "POST",
  });
}

// Obtener mis preferencias — GET /api/preferences/me
async function obtenerMisPreferencias() {
  return httpClient.request("/api/preferences/me");
}

// Actualizar mis preferencias — PUT /api/preferences/me
async function actualizarMisPreferencias(preferences) {
  return httpClient.request("/api/preferences/me", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}

// Obtener preferencias por ID de usuario — GET /api/preferences/user_id/:userIdParam
async function obtenerPreferenciasPorUsuario(userId) {
  return httpClient.request(`/api/preferences/user_id/${userId}`);
}

export const preferenciaService = {
  obtenerDefiniciones,
  insertarPreferenciasPorDefecto,
  obtenerMisPreferencias,
  actualizarMisPreferencias,
  obtenerPreferenciasPorUsuario,
};

export default preferenciaService;
