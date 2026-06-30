// YouConnext - Combustible Service (api-travels)
import httpClient from "./httpClient";

// Listado de provincias — GET /api/oil/provincias
async function obtenerProvincias() {
  return httpClient.request("/api/oil/provincias");
}

// Municipios por provincia — GET /api/oil/provincias/:idProvincia/municipios
async function obtenerMunicipios(idProvincia) {
  return httpClient.request(`/api/oil/provincias/${idProvincia}/municipios`);
}

// Estaciones por municipio — GET /api/oil/estaciones/municipio/:idMunicipio
async function obtenerEstacionesPorMunicipio(idMunicipio) {
  return httpClient.request(`/api/oil/estaciones/municipio/${idMunicipio}`);
}

// Estaciones por radio — GET /api/oil/estaciones/radio
async function obtenerEstacionesPorRadio({
  latitud,
  longitud,
  radio,
  pagina,
  limite,
}) {
  const params = new URLSearchParams({
    latitud: String(latitud),
    longitud: String(longitud),
  });
  if (radio) params.set("radio", String(radio));
  if (pagina) params.set("pagina", String(pagina));
  if (limite) params.set("limite", String(limite));
  return httpClient.request(`/api/oil/estaciones/radio?${params.toString()}`);
}

// Detalles de una estación — GET /api/oil/estaciones/:idEstacion/detalles
async function obtenerDetallesEstacion(idEstacion) {
  return httpClient.request(`/api/oil/estaciones/${idEstacion}/detalles`);
}

// Estaciones cercanas a una estación — GET /api/oil/estaciones/:idEstacion/cerca
async function obtenerEstacionesCercanas(idEstacion, radio) {
  const params = radio ? `?radio=${radio}` : "";
  return httpClient.request(`/api/oil/estaciones/${idEstacion}/cerca${params}`);
}

// Histórico de precios de una estación — GET /api/oil/estaciones/:idEstacion/historico
async function obtenerHistoricoPrecios(idEstacion, fechaInicio, fechaFin) {
  const params = new URLSearchParams();
  if (fechaInicio) params.set("fechaInicio", fechaInicio);
  if (fechaFin) params.set("fechaFin", fechaFin);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return httpClient.request(`/api/oil/estaciones/${idEstacion}/historico${qs}`);
}

// Precio medio diario — GET /api/oil/precio-medio-diario
async function obtenerPrecioMedioDiario({
  idFuelType,
  fechaInicio,
  fechaFin,
} = {}) {
  const params = new URLSearchParams();
  if (idFuelType) params.set("idFuelType", String(idFuelType));
  if (fechaInicio) params.set("fechaInicio", fechaInicio);
  if (fechaFin) params.set("fechaFin", fechaFin);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return httpClient.request(`/api/oil/precio-medio-diario${qs}`);
}

// Precios medios por provincia (por ID) — GET /api/oil/precios/medios/provincia/:idProvincia
async function obtenerPreciosMediosPorProvinciaId(idProvincia, idFuelType) {
  const params = idFuelType ? `?idFuelType=${idFuelType}` : "";
  return httpClient.request(
    `/api/oil/precios/medios/provincia/${idProvincia}${params}`,
  );
}

// Precios medios por provincia (por nombre) — GET /api/oil/precios/medios/provincia-nombre/:provincia
async function obtenerPreciosMediosPorProvinciaNombre(provincia, idFuelType) {
  const params = idFuelType ? `?idFuelType=${idFuelType}` : "";
  return httpClient.request(
    `/api/oil/precios/medios/provincia-nombre/${encodeURIComponent(provincia)}${params}`,
  );
}

// Precio medio de gasoil por provincia (por ID) — GET /api/oil/precios/gasoil/provincia/:idProvincia
async function obtenerPrecioGasoilPorProvinciaId(idProvincia) {
  return httpClient.request(`/api/oil/precios/gasoil/provincia/${idProvincia}`);
}

// Precio medio de gasoil por provincia (por nombre) — GET /api/oil/precios/gasoil/provincia-nombre/:provincia
async function obtenerPrecioGasoilPorProvinciaNombre(provincia) {
  return httpClient.request(
    `/api/oil/precios/gasoil/provincia-nombre/${encodeURIComponent(provincia)}`,
  );
}

// Precios por provincia (por nombre) — GET /api/oil/precios/provincia/:provincia
async function obtenerPreciosPorProvinciaNombre(provincia, idFuelType) {
  const params = idFuelType ? `?idFuelType=${idFuelType}` : "";
  return httpClient.request(
    `/api/oil/precios/provincia/${encodeURIComponent(provincia)}${params}`,
  );
}

export const combustibleService = {
  obtenerProvincias,
  obtenerMunicipios,
  obtenerEstacionesPorMunicipio,
  obtenerEstacionesPorRadio,
  obtenerDetallesEstacion,
  obtenerEstacionesCercanas,
  obtenerHistoricoPrecios,
  obtenerPrecioMedioDiario,
  obtenerPreciosMediosPorProvinciaId,
  obtenerPreciosMediosPorProvinciaNombre,
  obtenerPrecioGasoilPorProvinciaId,
  obtenerPrecioGasoilPorProvinciaNombre,
  obtenerPreciosPorProvinciaNombre,
};

export default combustibleService;
