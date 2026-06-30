// YouConnext - Ubicación Service (api-travels — direcciones guardadas)
import httpClient from "./httpClient";

// Crear ubicación — POST /api/ubicacion
async function crearUbicacion(datos) {
  return httpClient.request("/api/ubicacion", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

// Obtener todas las ubicaciones — GET /api/ubicacion
async function obtenerTodasUbicaciones() {
  return httpClient.request("/api/ubicacion");
}

// Obtener ubicaciones por usuario — GET /api/ubicacion/user_id/:userIdParam
async function obtenerUbicacionesPorUsuario(userId) {
  return httpClient.request(`/api/ubicacion/user_id/${userId}`);
}

// Obtener ubicación por ID — GET /api/ubicacion/:id
async function obtenerUbicacionPorId(id) {
  return httpClient.request(`/api/ubicacion/${id}`);
}

// Actualizar ubicación — PUT /api/ubicacion/:id
async function actualizarUbicacion(id, datos) {
  return httpClient.request(`/api/ubicacion/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

// Eliminar ubicación — DELETE /api/ubicacion/:id
async function eliminarUbicacion(id) {
  return httpClient.request(`/api/ubicacion/${id}`, {
    method: "DELETE",
  });
}

export const ubicacionTravelService = {
  crearUbicacion,
  obtenerTodasUbicaciones,
  obtenerUbicacionesPorUsuario,
  obtenerUbicacionPorId,
  actualizarUbicacion,
  eliminarUbicacion,
};

export default ubicacionTravelService;
