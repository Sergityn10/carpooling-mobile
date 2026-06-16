// YouConnext - PerfilScreen
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../constants";
import { Button } from "../components";

const PerfilScreen = ({ navigation }) => {
  const { user, crearUsuario, iniciarSesion, cerrarSesion } = useUser();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dni: "",
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.dni) {
      Alert.alert("Error", "El DNI es requerido.");
      return;
    }

    if (!isLogin && !formData.nombre) {
      Alert.alert("Error", "El nombre es requerido.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await iniciarSesion(formData.dni);
        Alert.alert("¡Bienvenido! 👋");
      } else {
        await crearUsuario(formData);
        Alert.alert("¡Perfil creado! 🎉");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Algo salió mal.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, cerrar",
          style: "destructive",
          onPress: async () => {
            await cerrarSesion();
          },
        },
      ],
    );
  };

  // Si no hay usuario, mostrar formulario de login/registro
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>YouConnext</Text>
          <Text style={styles.subtitle}>
            {isLogin ? "Inicia sesión para continuar" : "Crea tu perfil"}
          </Text>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Toggle login/register */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isLogin && styles.toggleButtonActive,
              ]}
              onPress={() => setIsLogin(true)}
            >
              <Text
                style={[styles.toggleText, isLogin && styles.toggleTextActive]}
              >
                Iniciar sesión
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !isLogin && styles.toggleButtonActive,
              ]}
              onPress={() => setIsLogin(false)}
            >
              <Text
                style={[styles.toggleText, !isLogin && styles.toggleTextActive]}
              >
                Registrarse
              </Text>
            </TouchableOpacity>
          </View>

          {/* DNI */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DNI *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 12345678A"
              placeholderTextColor={COLORS.gray400}
              value={formData.dni}
              onChangeText={(v) => handleInputChange("dni", v)}
              autoCapitalize="characters"
            />
          </View>

          {/* Solo mostrar si es registro */}
          {!isLogin && (
            <>
              {/* Nombre */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor={COLORS.gray400}
                  value={formData.nombre}
                  onChangeText={(v) => handleInputChange("nombre", v)}
                />
              </View>

              {/* Apellidos */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apellidos</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Tus apellidos"
                  placeholderTextColor={COLORS.gray400}
                  value={formData.apellidos}
                  onChangeText={(v) => handleInputChange("apellidos", v)}
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={COLORS.gray400}
                  value={formData.email}
                  onChangeText={(v) => handleInputChange("email", v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Teléfono */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+34 600 000 000"
                  placeholderTextColor={COLORS.gray400}
                  value={formData.telefono}
                  onChangeText={(v) => handleInputChange("telefono", v)}
                  keyboardType="phone-pad"
                />
              </View>
            </>
          )}

          <Button
            title={isLogin ? "Iniciar sesión" : "Crear perfil"}
            onPress={handleSubmit}
            variant="primary"
            size="large"
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Si hay usuario, mostrar perfil
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.profileContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.nombre?.charAt(0) || "?"}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user.nombre} {user.apellidos}
          </Text>
          <Text style={styles.userDNI}>DNI: {user.dni}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📧</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>
                  {user.email || "No proporcionado"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📱</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>
                  {user.telefono || "No proporcionado"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Miembro desde</Text>
                <Text style={styles.infoValue}>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("es-ES")
                    : "Desconocido"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Mis estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {user.viajesComoConductor?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Viajes como conductor</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {user.viajesComoPasajero?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Viajes como pasajero</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.actionsSection}>
          <Button
            title="✏️ Editar perfil"
            onPress={() => {}}
            variant="outline"
            size="medium"
            style={styles.actionButton}
          />
          <Button
            title="📋 Historial de viajes"
            onPress={() => navigation.navigate("Historial")}
            variant="outline"
            size="medium"
            style={styles.actionButton}
          />
          <Button
            title="🚪 Cerrar sesión"
            onPress={handleLogout}
            variant="ghost"
            size="medium"
            textStyle={{ color: COLORS.error }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    fontSize: FONTS.xxl,
    color: COLORS.gray700,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray700,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.md,
    color: COLORS.gray500,
    textAlign: "center",
  },
  form: {
    flex: 1,
    padding: SPACING.lg,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  toggleText: {
    fontSize: FONTS.md,
    color: COLORS.gray500,
    fontWeight: "500",
  },
  toggleTextActive: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.gray700,
    borderWidth: 2,
    borderColor: "transparent",
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  profileContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  avatarText: {
    fontSize: FONTS.title,
    fontWeight: "bold",
    color: COLORS.white,
  },
  userName: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  userDNI: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  infoSection: {
    marginBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoIcon: {
    fontSize: FONTS.xl,
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
  },
  infoValue: {
    fontSize: FONTS.md,
    color: COLORS.gray700,
    fontWeight: "500",
  },
  statsSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    alignItems: "center",
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: FONTS.xxl,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    textAlign: "center",
  },
  actionsSection: {
    marginBottom: SPACING.xl,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
});

export default PerfilScreen;
