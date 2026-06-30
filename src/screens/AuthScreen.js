// YouConnext - AuthScreen (pantalla de autenticacion unificada)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Mail, Lock } from "lucide-react-native";
import { useUser } from "../context/UserContext";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../constants";
import { Button } from "../components";

// Configurar Google Sign-In con el Web Client ID
console.log(
  "Configurando Google Sign-In con Web Client ID:",
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
);
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

const AuthScreen = () => {
  const { iniciarSesion, crearUsuario, loginGoogleNative } = useUser();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Verificar si el dispositivo soporta Google Sign-In
    GoogleSignin.hasPlayServices()
      .then((hasServices) => {
        if (!hasServices) {
          console.warn("Google Play Services no disponibles");
        }
      })
      .catch((err) => console.warn("Error checking Play Services:", err));
  }, []);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "El email es requerido.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "La contrasena es requerida.");
      return;
    }
    if (mode === "register" && password.length < 6) {
      Alert.alert("Error", "La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await iniciarSesion(email.trim(), password);
      } else {
        await crearUsuario(email.trim(), password);
        Alert.alert(
          "Cuenta creada",
          "Completa tu perfil en la seccion de informacion.",
        );
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Algo salio mal.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      // Cerrar cualquier sesión previa de Google para forzar el selector de cuentas
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignorar si no hay sesión previa
      }

      // Iniciar flujo nativo de Google Sign-In
      const userInfo = await GoogleSignin.signIn();
      console.log("UserInfo nativo obtenido:", JSON.stringify(userInfo));

      // Obtener el id_token del usuario autenticado
      const tokens = await GoogleSignin.getTokens();
      const idToken = tokens.idToken;
      console.log(
        "Tokens nativos obtenidos, idToken largo:",
        idToken ? idToken.substring(0, 30) + "..." : "null",
      );

      if (!idToken) {
        Alert.alert("Error", "No se pudo obtener el token de Google.");
        setGoogleLoading(false);
        return;
      }

      console.log("Enviando id_token al backend con metodo:", mode);
      // Enviar el id_token al backend
      await loginGoogleNative(idToken, mode);
    } catch (error) {
      if (error.code === "12501") {
        // Usuario cancelo el login
      } else {
        Alert.alert(
          "Error",
          error.message || "No se pudo completar la autenticacion con Google.",
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo y header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>YC</Text>
            </View>
            <Text style={styles.title}>
              {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
            </Text>
            <Text style={styles.subtitle}>
              {mode === "login"
                ? "Inicia sesion para continuar"
                : "Unete a la comunidad YouConnext"}
            </Text>
          </View>

          {/* Boton de Google */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleAuth}
            disabled={googleLoading || loading}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color={COLORS.gray700} />
            ) : (
              <>
                <GoogleIcon />
                <Text style={styles.googleButtonText}>
                  {mode === "login"
                    ? "Continuar con Google"
                    : "Registrarse con Google"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Formulario email/password */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={COLORS.gray400} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={COLORS.gray400}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contrasena</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={COLORS.gray400} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder={
                    mode === "register"
                      ? "Minimo 6 caracteres"
                      : "Tu contrasena"
                  }
                  placeholderTextColor={COLORS.gray400}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Button
              title={mode === "login" ? "Iniciar sesion" : "Crear cuenta"}
              onPress={handleSubmit}
              variant="primary"
              size="large"
              loading={loading}
              style={styles.submitButton}
            />
          </View>

          {/* Toggle login/register */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {mode === "login" ? "No tienes cuenta?" : "Ya tienes cuenta?"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setMode(mode === "login" ? "register" : "login");
                setEmail("");
                setPassword("");
              }}
            >
              <Text style={styles.toggleLink}>
                {mode === "login" ? "Registrate" : "Inicia sesion"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Icono de Google como SVG inline (sin dependencias externas)
const GoogleIcon = () => (
  <View style={styles.googleIconContainer}>
    <Text style={styles.googleIconText}>G</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  logoText: {
    fontSize: FONTS.xxl,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: -1,
  },
  title: {
    fontSize: FONTS.xxl,
    fontWeight: "bold",
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONTS.md,
    color: COLORS.gray500,
    textAlign: "center",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    ...SHADOWS.small,
  },
  googleButtonText: {
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.gray700,
    marginLeft: SPACING.sm,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  dividerText: {
    fontSize: FONTS.sm,
    color: COLORS.gray400,
    marginHorizontal: SPACING.md,
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    fontSize: FONTS.md,
    color: COLORS.gray800,
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  toggleText: {
    fontSize: FONTS.md,
    color: COLORS.gray500,
  },
  toggleLink: {
    fontSize: FONTS.md,
    color: COLORS.primary,
    fontWeight: "bold",
    marginLeft: SPACING.xs,
  },
});

export default AuthScreen;
