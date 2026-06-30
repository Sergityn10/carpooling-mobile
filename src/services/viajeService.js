// YouConnext - Viaje Service
import httpClient from "./httpClient";

// Crear viaje — POST /api/trayecto
async function crearViaje(datos) {
  return httpClient.request("/api/trayecto", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

// Obtener viaje por ID — GET /api/trayecto/:id
async function obtenerViaje(id) {
  return httpClient.request(`/api/trayecto/${id}`);
}

// Obtener viaje por código QR — GET /api/trayecto/qr/:codigo
async function obtenerViajePorQR(codigo) {
  return httpClient.request(`/api/trayecto/qr/${codigo}`);
}

// Unirse a un viaje — POST /api/trayecto/unirse
async function unirseViaje(codigoQR, pasajeroId) {
  return httpClient.request("/api/trayecto/unirse", {
    method: "POST",
    body: JSON.stringify({ codigoQR, pasajeroId }),
  });
}

// Iniciar viaje — POST /api/trayecto/:id/iniciar
async function iniciarViaje(id) {
  return httpClient.request(`/api/trayecto/${id}/iniciar`, {
    method: "POST",
  });
}

// Finalizar viaje — POST /api/trayecto/:id/finalizar
async function completarViaje(id) {
  return httpClient.request(`/api/trayecto/${id}/finalizar`, {
    method: "POST",
  });
}

// Cancelar viaje — DELETE /api/trayecto/:id
async function cancelarViaje(id) {
  return httpClient.request(`/api/trayecto/${id}`, {
    method: "DELETE",
  });
}

// Listar viajes activos — GET /api/trayecto
async function listarViajesActivos() {
  return httpClient.request("/api/trayecto");
}

// Listar todos los viajes — GET /api/trayecto
async function listarViajes() {
  return httpClient.request("/api/trayecto");
}

// Obtener trayectos por conductor — GET /api/trayecto/conductor/:id
async function obtenerHistorialUsuario(usuarioId) {
  return httpClient.request(`/api/trayecto/conductor/${usuarioId}`);
}

export const viajeService = {
  crearViaje,
  obtenerViaje,
  obtenerViajePorQR,
  unirseViaje,
  iniciarViaje,
  completarViaje,
  cancelarViaje,
  listarViajesActivos,
  listarViajes,
  obtenerHistorialUsuario,
};

export default viajeService;
