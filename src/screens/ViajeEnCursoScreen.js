// YouConnext - ViajeEnCursoScreen
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";
import { useViaje } from "../context/ViajeContext";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONTS,
  SHADOWS,
  VIAJE_ESTADO,
} from "../constants";
import TripMapPreview from "../components/TripMapPreview";
import { QRCodeModal } from "../components";

const ViajeEnCursoScreen = ({ route, navigation }) => {
  const { user } = useUser();
  const { viajeActivo, iniciarViaje } = useViaje();

  const viaje = route?.params?.viaje || viajeActivo;
  const [showQR, setShowQR] = useState(false);

  const origen = useMemo(() => {
    if (viaje?.puntoInicialLat == null || viaje?.puntoInicialLng == null)
      return null;
    return {
      latitude: viaje.puntoInicialLat,
      longitude: viaje.puntoInicialLng,
      name: viaje?.puntoInicialNombre,
      address: viaje?.puntoInicialDireccion,
    };
  }, [viaje]);

  const destino = useMemo(() => {
    if (viaje?.puntoFinalLat == null || viaje?.puntoFinalLng == null)
      return null;
    return {
      latitude: viaje.puntoFinalLat,
      longitude: viaje.puntoFinalLng,
      name: viaje?.puntoFinalNombre,
      address: viaje?.puntoFinalDireccion,
    };
  }, [viaje]);

  const canStart = viaje?.estado === VIAJE_ESTADO.PENDIENTE;

  if (!viaje) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Viaje</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay viaje activo</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Recorrido</Text>
          <Text style={styles.headerSubtitle}>
            {viaje?.estado === VIAJE_ESTADO.ACTIVO
              ? "🟢 En curso"
              : viaje?.estado === VIAJE_ESTADO.PENDIENTE
                ? "⏳ Pendiente"
                : viaje?.estado}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.mapContainer}>
        <TripMapPreview origin={origen} destination={destino} height={420} />
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => setShowQR(true)}
        >
          <Text style={styles.bottomButtonText}>📱 QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomButtonMiddle]}
          onPress={() => navigation.navigate("ViajeDetalle", { viaje })}
        >
          <Text style={styles.bottomButtonText}>👥 Pasajeros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bottomButton,
            styles.startButton,
            !canStart && styles.startButtonDisabled,
          ]}
          disabled={!canStart}
          onPress={async () => {
            try {
              if (!user) {
                Alert.alert(
                  "Inicia sesión",
                  "Debes iniciar sesión para iniciar el viaje.",
                );
                return;
              }
              await iniciarViaje();
              Alert.alert("¡Viaje iniciado!", "El tracking GPS está activo.");
            } catch (e) {
              Alert.alert(
                "Error",
                e?.message || "No se pudo iniciar el viaje.",
              );
            }
          }}
        >
          <Text style={styles.startButtonText}>
            {canStart ? "🚀 Empezar" : "🟢 En curso"}
          </Text>
        </TouchableOpacity>
      </View>

      <QRCodeModal
        visible={showQR}
        onClose={() => setShowQR(false)}
        viaje={viaje}
        codigoQR={viaje?.codigoQR}
      />
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
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray700,
  },
  headerSubtitle: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  backButton: {
    fontSize: FONTS.xxl,
    color: COLORS.gray700,
  },
  mapContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  bottomBar: {
    flexDirection: "row",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  bottomButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomButtonMiddle: {
    flex: 1.2,
  },
  bottomButtonText: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.gray700,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  startButtonDisabled: {
    backgroundColor: COLORS.gray300,
    borderColor: COLORS.gray300,
  },
  startButtonText: {
    fontSize: FONTS.sm,
    fontWeight: "700",
    color: COLORS.white,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: FONTS.md,
    color: COLORS.gray600,
  },
});

export default ViajeEnCursoScreen;
