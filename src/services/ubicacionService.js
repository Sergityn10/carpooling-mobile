// YouConnext - Ubicación Service
import httpClient from "./httpClient";

// Registrar ubicación — POST /api/ubicaciones
async function registrarUbicacion(datos) {
  return httpClient.request("/api/ubicaciones", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

// Registrar ubicaciones en batch — POST /api/ubicaciones/batch
async function registrarUbicacionesBatch(ubicaciones) {
  return httpClient.request("/api/ubicaciones/batch", {
    method: "POST",
    body: JSON.stringify({ ubicaciones }),
  });
}

// Obtener ubicaciones de un viaje — GET /api/ubicaciones/viaje/:viajeId
async function obtenerUbicacionesViaje(viajeId) {
  return httpClient.request(`/api/ubicaciones/viaje/${viajeId}`);
}

// Obtener última ubicación — GET /api/ubicaciones/viaje/:viajeId/ultima
async function obtenerUltimaUbicacion(viajeId) {
  return httpClient.request(`/api/ubicaciones/viaje/${viajeId}/ultima`);
}

// Calcular distancia — GET /api/ubicaciones/viaje/:viajeId/distancia
async function calcularDistancia(viajeId) {
  return httpClient.request(`/api/ubicaciones/viaje/${viajeId}/distancia`);
}

export const ubicacionService = {
  registrarUbicacion,
  registrarUbicacionesBatch,
  obtenerUbicacionesViaje,
  obtenerUltimaUbicacion,
  calcularDistancia,
};

export default ubicacionService;
