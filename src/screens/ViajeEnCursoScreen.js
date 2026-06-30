// YouConnext - ViajeEnCursoScreen
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Play,
  Clock,
  QrCode,
  Users,
  CircleDot,
} from "lucide-react-native";
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
import { QRCodeModal, TripMapPreview } from "../components";

const ViajeEnCursoScreen = ({ route, navigation }) => {
  const { user } = useUser();
  const { viajeActivo, iniciarViaje } = useViaje();

  const viaje = route?.params?.viaje || viajeActivo;
  const [showQR, setShowQR] = useState(false);

  const origen = useMemo(() => {
    const lat = viaje?.origen_lat ?? viaje?.puntoInicialLat;
    const lng = viaje?.origen_lng ?? viaje?.puntoInicialLng;
    if (lat == null || lng == null) return null;
    return {
      latitude: Number(lat),
      longitude: Number(lng),
      name: viaje?.origen || viaje?.puntoInicialNombre || "Origen",
      address:
        viaje?.origen ||
        viaje?.puntoInicialDireccion ||
        viaje?.puntoInicialNombre ||
        "",
    };
  }, [viaje]);

  const destino = useMemo(() => {
    const lat = viaje?.destino_lat ?? viaje?.puntoFinalLat;
    const lng = viaje?.destino_lng ?? viaje?.puntoFinalLng;
    if (lat == null || lng == null) return null;
    return {
      latitude: Number(lat),
      longitude: Number(lng),
      name: viaje?.destino || viaje?.puntoFinalNombre || "Destino",
      address:
        viaje?.destino ||
        viaje?.puntoFinalDireccion ||
        viaje?.puntoFinalNombre ||
        "",
    };
  }, [viaje]);

  const estadoViaje = (viaje?.status || viaje?.estado || "").toLowerCase();
  const canStart =
    estadoViaje === "pendiente" || estadoViaje === "pendiente_pago";

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
          <ChevronLeft size={24} color={COLORS.gray800} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Recorrido</Text>
          <Text style={styles.headerSubtitle}>
            {estadoViaje === "activo" || estadoViaje === "en curso"
              ? "En curso"
              : estadoViaje === "pendiente"
                ? "Pendiente"
                : viaje?.status || viaje?.estado}
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapContainer}>
        <TripMapPreview origin={origen} destination={destino} height={420} />
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => setShowQR(true)}
        >
          <QrCode size={20} color={COLORS.gray700} strokeWidth={2} />
          <Text style={styles.bottomButtonText}>QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomButtonMiddle]}
          onPress={() => navigation.navigate("ViajeDetalle", { viaje })}
        >
          <Users size={20} color={COLORS.gray700} strokeWidth={2} />
          <Text style={styles.bottomButtonText}>Pasajeros</Text>
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
                  "Inicia sesion",
                  "Debes iniciar sesion para iniciar el viaje.",
                );
                return;
              }
              await iniciarViaje(viaje);
              Alert.alert("Viaje iniciado", "El tracking GPS esta activo.");
            } catch (e) {
              Alert.alert(
                "Error",
                e?.message || "No se pudo iniciar el viaje.",
              );
            }
          }}
        >
          <Text style={styles.startButtonText}>
            {canStart ? "Empezar" : "En curso"}
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
  bottomButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
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
    gap: SPACING.xs,
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
