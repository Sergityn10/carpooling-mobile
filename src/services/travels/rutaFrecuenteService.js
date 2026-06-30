// YouConnext - Ruta Frecuente Service (api-travels)
import httpClient from "./httpClient";

// Crear ruta frecuente — POST /api/frequent-routes
async function crearRutaFrecuente(datos) {
  return httpClient.request("/api/frequent-routes", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

// Obtener mis rutas frecuentes — GET /api/frequent-routes/me
async function obtenerMisRutasFrecuentes() {
  return httpClient.request("/api/frequent-routes/me");
}

// Obtener rutas frecuentes por usuario — GET /api/frequent-routes/user_id/:userIdParam
async function obtenerRutasFrecuentesPorUsuario(userId) {
  return httpClient.request(`/api/frequent-routes/user_id/${userId}`);
}

// Obtener ruta frecuente por ID — GET /api/frequent-routes/:id
async function obtenerRutaFrecuentePorId(id) {
  return httpClient.request(`/api/frequent-routes/${id}`);
}

// Actualizar ruta frecuente — PATCH /api/frequent-routes/:id
async function actualizarRutaFrecuente(id, datos) {
  return httpClient.request(`/api/frequent-routes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}

// Eliminar ruta frecuente — DELETE /api/frequent-routes/:id
async function eliminarRutaFrecuente(id) {
  return httpClient.request(`/api/frequent-routes/${id}`, {
    method: "DELETE",
  });
}

export const rutaFrecuenteService = {
  crearRutaFrecuente,
  obtenerMisRutasFrecuentes,
  obtenerRutasFrecuentesPorUsuario,
  obtenerRutaFrecuentePorId,
  actualizarRutaFrecuente,
  eliminarRutaFrecuente,
};

export default rutaFrecuenteService;
