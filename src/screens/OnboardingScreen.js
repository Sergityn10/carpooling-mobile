// YouConnext - OnboardingScreen
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, Phone } from "lucide-react-native";
import { useUser } from "../context/UserContext";
import { COLORS, SPACING, RADIUS, FONTS } from "../constants";
import { Button } from "../components";

const OnboardingScreen = () => {
  const { actualizarUsuario } = useUser();
  const [step, setStep] = useState(0);
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);

  const totalSteps = 2;

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    if (!date) return "Selecciona tu fecha de nacimiento";
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  };

  const onDateChange = useCallback((event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && selectedDate) {
      setFechaNacimiento(selectedDate);
    }
  }, []);

  const validateTelefono = (value) => {
    const cleaned = value.replace(/[\s\-+()]/g, "");
    return cleaned.length >= 9 && /^\d+$/.test(cleaned);
  };

  const handleNext = () => {
    if (step === 0) {
      if (!fechaNacimiento) {
        Alert.alert(
          "Fecha requerida",
          "Por favor, selecciona tu fecha de nacimiento",
        );
        return;
      }
      setStep(1);
    }
  };

  const handleFinish = async () => {
    if (!validateTelefono(telefono)) {
      Alert.alert(
        "Teléfono inválido",
        "Introduce un número de teléfono válido (mínimo 9 dígitos)",
      );
      return;
    }

    setLoading(true);
    try {
      const cleanedPhone = telefono.replace(/[\s\-+()]/g, "");
      await actualizarUsuario({
        fecha_nacimiento: formatDate(fechaNacimiento),
        phone: cleanedPhone,
        onboarding_ended: true,
      });
    } catch (e) {
      Alert.alert(
        "Error",
        e.message || "No se pudo completar el onboarding. Inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? StatusBar.currentHeight : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i <= step && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Step 0: Fecha de nacimiento */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconWrapper}>
                <Calendar size={48} color={COLORS.primary} strokeWidth={2} />
              </View>
              <Text style={styles.title}>¿Cuándo naciste?</Text>
              <Text style={styles.subtitle}>
                Necesitamos tu fecha de nacimiento para verificar tu edad
              </Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateButtonText,
                      !fechaNacimiento && styles.dateButtonPlaceholder,
                    ]}
                  >
                    {formatDateDisplay(fechaNacimiento)}
                  </Text>
                  <Calendar size={20} color={COLORS.gray400} strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={fechaNacimiento || new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  onChange={onDateChange}
                  textColor={COLORS.primary}
                  accentColor={COLORS.primary}
                />
              )}

              {Platform.OS === "ios" && showDatePicker && (
                <TouchableOpacity
                  style={styles.confirmDateButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.confirmDateText}>Confirmar fecha</Text>
                </TouchableOpacity>
              )}

              <Button
                title="Continuar"
                onPress={handleNext}
                disabled={!fechaNacimiento}
                style={styles.button}
              />
            </View>
          )}

          {/* Step 1: Teléfono */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.iconWrapper}>
                <Phone size={48} color={COLORS.primary} strokeWidth={2} />
              </View>
              <Text style={styles.title}>Tu teléfono</Text>
              <Text style={styles.subtitle}>
                Usaremos tu número para contactarte sobre tus viajes
              </Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Número de teléfono</Text>
                <TextInput
                  style={styles.input}
                  placeholder="600 123 456"
                  placeholderTextColor={COLORS.gray400}
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                  maxLength={12}
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Atrás"
                  onPress={() => setStep(0)}
                  variant="outline"
                  style={styles.backButton}
                />
                {loading ? (
                  <View style={styles.loadingWrapper}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  </View>
                ) : (
                  <Button
                    title="Finalizar"
                    onPress={handleFinish}
                    disabled={!telefono}
                    style={styles.button}
                  />
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray200,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONTS.xxxl,
    fontWeight: "700",
    color: COLORS.gray900,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONTS.md,
    color: COLORS.gray500,
    textAlign: "center",
    marginBottom: SPACING.xxl,
    lineHeight: 22,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === "ios" ? SPACING.md : SPACING.sm + 2,
    fontSize: FONTS.lg,
    color: COLORS.gray900,
    backgroundColor: COLORS.white,
  },
  inputHint: {
    fontSize: FONTS.xs,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  dateButtonText: {
    fontSize: FONTS.md,
    color: COLORS.gray900,
    fontWeight: "500",
  },
  dateButtonPlaceholder: {
    color: COLORS.gray400,
  },
  confirmDateButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.md,
    alignSelf: "center",
  },
  confirmDateText: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
  button: {
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    gap: SPACING.md,
  },
  backButton: {
    width: "100%",
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default OnboardingScreen;
