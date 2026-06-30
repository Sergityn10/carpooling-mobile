// YouConnext - PerfilScreen (perfil del usuario autenticado)
import React from "react";
import { Alert } from "react-native";
import { useUser } from "../context/UserContext";
import { ProfileView } from "../components";

const PerfilScreen = ({ navigation }) => {
  const { user, cerrarSesion } = useUser();

  const handleLogout = () => {
    Alert.alert("Cerrar sesion", "Estas seguro de que quieres cerrar sesion?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Si, cerrar",
        style: "destructive",
        onPress: async () => {
          await cerrarSesion();
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <ProfileView user={user} navigation={navigation} onLogout={handleLogout} />
  );
};

export default PerfilScreen;
