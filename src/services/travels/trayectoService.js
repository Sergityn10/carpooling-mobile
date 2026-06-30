// YouConnext - Trayecto Service (api-travels)
import httpClient from "./httpClient";

// Obtener todos los trayectos — GET /api/trayecto
async function obtenerTrayectos() {
  return httpClient.request("/api/trayecto");
}

// Buscar trayectos — GET /api/trayecto/search
async function buscarTrayectos({
  origin,
  destination,
  date,
  passengers,
  page,
  limit,
}) {
  const params = new URLSearchParams({
    origin,
    destination,
    date,
    passengers: String(passengers),
  });
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  return httpClient.request(`/api/trayecto/search?${params.toString()}`);
}

// Obtener mis trayectos (como conductor) — GET /api/trayecto/mis-trayectos
async function obtenerMisTrayectos() {
  return httpClient.request("/api/trayecto/mis-trayectos");
}

// Obtener próximos trayectos (conductor o pasajero) — GET /api/trayecto/proximos
async function obtenerProximosTrayectos() {
  return httpClient.request("/api/trayecto/proximos");
}

// Obtener trayecto por ID — GET /api/trayecto/:id
async function obtenerTrayectoPorId(id) {
  return httpClient.request(`/api/trayecto/${id}`);
}

// Crear trayecto — POST /api/trayecto
async function crearTrayecto(datos) {
  return httpClient.request("/api/trayecto", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

// Actualizar coordenadas de un trayecto — PUT /api/trayecto/update/id/:id
async function actualizarCoordenadasTrayecto(id) {
  return httpClient.request(`/api/trayecto/update/id/${id}`, {
    method: "PUT",
  });
}

// Actualizar coordenadas de todos los trayectos — PUT /api/trayecto/update
async function actualizarCoordenadasTodos() {
  return httpClient.request("/api/trayecto/update", {
    method: "PUT",
  });
}

// Actualizar trayecto (PUT) — PUT /api/trayecto/:id
async function actualizarTrayectoPut(id, datos) {
  return httpClient.request(`/api/trayecto/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });
}

// Actualizar trayecto (PATCH) — PATCH /api/trayecto/:id
async function actualizarTrayectoPatch(id, datos) {
  return httpClient.request(`/api/trayecto/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}

// Iniciar trayecto — POST /api/trayecto/:id/iniciar
async function iniciarTrayecto(id) {
  return httpClient.request(`/api/trayecto/${id}/iniciar`, {
    method: "POST",
  });
}

// Guardar ubicación del recorrido — POST /api/trayecto/:id/recorrido
async function guardarRecorrido(id, { lat, lng, address }) {
  return httpClient.request(`/api/trayecto/${id}/recorrido`, {
    method: "POST",
    body: JSON.stringify({ lat, lng, address }),
  });
}

// Obtener recorrido del trayecto — GET /api/trayecto/:id/recorrido
async function obtenerRecorrido(id) {
  return httpClient.request(`/api/trayecto/${id}/recorrido`);
}

// Finalizar trayecto — POST /api/trayecto/:id/finalizar
async function finalizarTrayecto(id) {
  return httpClient.request(`/api/trayecto/${id}/finalizar`, {
    method: "POST",
  });
}

// Obtener trayectos por conductor — GET /api/trayecto/conductor/:id
async function obtenerTrayectosPorConductor(conductorId) {
  return httpClient.request(`/api/trayecto/conductor/${conductorId}`);
}

// Eliminar trayecto — DELETE /api/trayecto/:id
async function eliminarTrayecto(id) {
  return httpClient.request(`/api/trayecto/${id}`, {
    method: "DELETE",
  });
}

export const trayectoService = {
  obtenerTrayectos,
  buscarTrayectos,
  obtenerMisTrayectos,
  obtenerProximosTrayectos,
  obtenerTrayectoPorId,
  crearTrayecto,
  iniciarTrayecto,
  guardarRecorrido,
  obtenerRecorrido,
  actualizarCoordenadasTrayecto,
  actualizarCoordenadasTodos,
  actualizarTrayectoPut,
  actualizarTrayectoPatch,
  finalizarTrayecto,
  obtenerTrayectosPorConductor,
  eliminarTrayecto,
};

export default trayectoService;
