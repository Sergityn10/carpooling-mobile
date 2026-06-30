// YouConnext - Usuario Service
import httpClient from "./httpClient";

// Obtener info del usuario autenticado — GET /api/users/info
// Retorna: { status, message, data: { name, surname, phone, email, img_perfil, role, averageRating, numOpinions, about_me, viajes, preferences } }
async function getUserInfo() {
  return httpClient.request("/api/users/info");
}

// Obtener usuario por ID — GET /api/users/:id
async function getUserById(id) {
  return httpClient.request(`/api/users/${id}`);
}

// Obtener info pública de usuario por ID — GET /api/users/:id/info
async function getUserPublicInfo(id) {
  return httpClient.request(`/api/users/${id}/info`);
}

// Actualizar usuario autenticado — PATCH /api/users
async function updateUser(datos) {
  return httpClient.request("/api/users", {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}

// Actualizar usuario por ID — PATCH /api/users/:id
async function updateUserById(id, datos) {
  return httpClient.request(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(datos),
  });
}

// Eliminar usuario — DELETE /api/users/:id
async function deleteUser(id) {
  return httpClient.request(`/api/users/${id}`, {
    method: "DELETE",
  });
}

// Listar usuarios — GET /api/users
async function listarUsuarios() {
  return httpClient.request("/api/users");
}

// Buscar usuarios por ubicación — GET /api/users/unique-by-location?location=...
async function searchUsersByLocation(location) {
  return httpClient.request(
    `/api/users/unique-by-location?location=${encodeURIComponent(location)}`,
  );
}

export const usuarioService = {
  getUserInfo,
  getUserById,
  getUserPublicInfo,
  updateUser,
  updateUserById,
  deleteUser,
  listarUsuarios,
  searchUsersByLocation,
};

export default usuarioService;
