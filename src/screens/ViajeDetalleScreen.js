// YouConnext - ViajeDetalleScreen
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
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
import { Button } from "../components";
import TripMapPreview from "../components/TripMapPreview";
import apiService from "../services/api";

const ViajeDetalleScreen = ({ route, navigation }) => {
  const { viaje: viajeInicial } = route.params || {};
  const { user } = useUser();
  const {
    viajeActivo,
    pasajeros,
    ubicaciones,
    trackingActivo,
    distanciaTotal,
  } = useViaje();

  const [viaje, setViaje] = useState(viajeInicial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viajeInicial?.id) {
      cargarDetalleViaje();
    }
  }, [viajeInicial?.id]);

  const cargarDetalleViaje = async () => {
    try {
      const detalle = await apiService.obtenerViaje(viajeInicial.id);
      setViaje(detalle);
    } catch (error) {
      console.log("Error al cargar detalle:", error);
    }
  };

  const getEstadoColor = () => {
    switch (viaje?.estado) {
      case VIAJE_ESTADO.PENDIENTE:
        return COLORS.warning;
      case VIAJE_ESTADO.ACTIVO:
        return COLORS.success;
      case VIAJE_ESTADO.COMPLETADO:
        return COLORS.gray400;
      case VIAJE_ESTADO.CANCELADO:
        return COLORS.error;
      default:
        return COLORS.gray400;
    }
  };

  const getEstadoTexto = () => {
    switch (viaje?.estado) {
      case VIAJE_ESTADO.PENDIENTE:
        return "⏳ Pendiente";
      case VIAJE_ESTADO.ACTIVO:
        return "🟢 En curso";
      case VIAJE_ESTADO.COMPLETADO:
        return "✅ Completado";
      case VIAJE_ESTADO.CANCELADO:
        return "❌ Cancelado";
      default:
        return viaje?.estado;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const esConductor = user?.id === viaje?.conductorId;

  const origen =
    viaje?.puntoInicialLat != null && viaje?.puntoInicialLng != null
      ? {
          latitude: viaje.puntoInicialLat,
          longitude: viaje.puntoInicialLng,
          name: viaje?.puntoInicialNombre,
        }
      : null;

  const destino =
    viaje?.puntoFinalLat != null && viaje?.puntoFinalLng != null
      ? {
          latitude: viaje.puntoFinalLat,
          longitude: viaje.puntoFinalLng,
          name: viaje?.puntoFinalNombre,
        }
      : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del viaje</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado del viaje */}
        <View
          style={[styles.estadoCard, { backgroundColor: getEstadoColor() }]}
        >
          <Text style={styles.estadoTexto}>{getEstadoTexto()}</Text>
          {trackingActivo && (
            <Text style={styles.trackingText}>📡 GPS activo</Text>
          )}
        </View>

        {/* Matrícula y vehículo */}
        <View style={styles.vehiculoSection}>
          <View style={styles.vehiculoIcon}>
            <Text style={styles.vehiculoIconText}>🚗</Text>
          </View>
          <View style={styles.vehiculoInfo}>
            <Text style={styles.matricula}>{viaje?.matricula}</Text>
            <Text style={styles.modelo}>
              {viaje?.modeloVehiculo || "Vehículo"}
              {viaje?.colorVehiculo && ` • ${viaje.colorVehiculo}`}
            </Text>
          </View>
        </View>

        {/* Conductor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Conductor</Text>
          <View style={styles.card}>
            <View style={styles.avatarConductor}>
              <Text style={styles.avatarText}>
                {viaje?.conductor?.nombre?.charAt(0) || "?"}
              </Text>
            </View>
            <View style={styles.conductorInfo}>
              <Text style={styles.conductorNombre}>
                {viaje?.conductor?.nombre || "Desconocido"}{" "}
                {viaje?.conductor?.apellidos}
              </Text>
              <Text style={styles.conductorDNI}>
                DNI: {viaje?.conductor?.dni}
              </Text>
            </View>
          </View>
        </View>

        {/* Ruta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Ruta</Text>
          <View style={styles.mapPreview}>
            <TripMapPreview
              origin={origen}
              destination={destino}
              height={180}
            />
          </View>
          <View style={styles.rutaCard}>
            <View style={styles.puntoRuta}>
              <View
                style={[
                  styles.puntoMarker,
                  { backgroundColor: COLORS.success },
                ]}
              />
              <View style={styles.puntoContent}>
                <Text style={styles.puntoLabel}>Inicio</Text>
                <Text style={styles.puntoNombre}>
                  {viaje?.puntoInicialNombre || "Ubicación inicial"}
                </Text>
                {viaje?.puntoInicialDireccion && (
                  <Text style={styles.puntoDireccion}>
                    {viaje.puntoInicialDireccion}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.rutaLinea} />
            <View style={styles.puntoRuta}>
              <View
                style={[styles.puntoMarker, { backgroundColor: COLORS.error }]}
              />
              <View style={styles.puntoContent}>
                <Text style={styles.puntoLabel}>Destino</Text>
                <Text style={styles.puntoNombre}>
                  {viaje?.puntoFinalNombre || "Ubicación final"}
                </Text>
                {viaje?.puntoFinalDireccion && (
                  <Text style={styles.puntoDireccion}>
                    {viaje.puntoFinalDireccion}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Pasajeros */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            👥 Pasajeros ({viaje?.pasajeros?.length || 0})
          </Text>
          {viaje?.pasajeros?.length > 0 ? (
            <View style={styles.pasajerosList}>
              {viaje.pasajeros.map((p, index) => (
                <View key={index} style={styles.pasajeroItem}>
                  <View style={styles.avatarPasajero}>
                    <Text style={styles.avatarPasajeroText}>
                      {p.usuario?.nombre?.charAt(0) || "?"}
                    </Text>
                  </View>
                  <View style={styles.pasajeroInfo}>
                    <Text style={styles.pasajeroNombre}>
                      {p.usuario?.nombre || "Desconocido"}
                    </Text>
                    <Text style={styles.pasajeroDNI}>{p.usuario?.dni}</Text>
                  </View>
                  {p.pickedUp && <Text style={styles.statusIcon}>✅</Text>}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyPasajeros}>
              <Text style={styles.emptyText}>
                No hay pasajeros en este viaje
              </Text>
            </View>
          )}
        </View>

        {/* Estadísticas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {viaje?.distanciaKm?.toFixed(2) ||
                  distanciaTotal.toFixed(2) ||
                  "0.00"}
              </Text>
              <Text style={styles.statLabel}>km</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {viaje?.duracionMinutos || "-"}
              </Text>
              <Text style={styles.statLabel}>minutos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {viaje?.pasajeros?.length || 0}
              </Text>
              <Text style={styles.statLabel}>pasajeros</Text>
            </View>
          </View>
        </View>

        {/* Código QR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Código para unirse</Text>
          <View style={styles.codigoCard}>
            <Text style={styles.codigoTexto}>{viaje?.codigoQR}</Text>
            <Text style={styles.codigoHint}>
              Compártelo con los pasajeros para que se unan al viaje
            </Text>
          </View>
        </View>

        {/* Tiempos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Tiempos</Text>
          <View style={styles.tiemposCard}>
            <View style={styles.tiempoRow}>
              <Text style={styles.tiempoLabel}>Creado</Text>
              <Text style={styles.tiempoValue}>
                {formatDate(viaje?.createdAt)}
              </Text>
            </View>
            {viaje?.fechaInicio && (
              <View style={styles.tiempoRow}>
                <Text style={styles.tiempoLabel}>Iniciado</Text>
                <Text style={styles.tiempoValue}>
                  {formatDate(viaje.fechaInicio)}
                </Text>
              </View>
            )}
            {viaje?.fechaFin && (
              <View style={styles.tiempoRow}>
                <Text style={styles.tiempoLabel}>Finalizado</Text>
                <Text style={styles.tiempoValue}>
                  {formatDate(viaje.fechaFin)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Ubicaciones GPS (últimas) */}
        {ubicaciones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Últimas ubicaciones</Text>
            <View style={styles.ubicacionesCard}>
              {ubicaciones.slice(-5).map((u, index) => (
                <View key={index} style={styles.ubicacionItem}>
                  <Text style={styles.ubicacionTiempo}>
                    {new Date(u.timestamp || u.createdAt).toLocaleTimeString(
                      "es-ES",
                    )}
                  </Text>
                  <Text style={styles.ubicacionCoords}>
                    {u.latitud?.toFixed(6)}, {u.longitud?.toFixed(6)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  estadoCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  estadoTexto: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.white,
  },
  trackingText: {
    fontSize: FONTS.sm,
    color: COLORS.white,
  },
  vehiculoSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  vehiculoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  vehiculoIconText: {
    fontSize: 30,
  },
  vehiculoInfo: {
    flex: 1,
  },
  matricula: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.gray700,
  },
  modelo: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  avatarConductor: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.white,
  },
  conductorInfo: {
    flex: 1,
  },
  conductorNombre: {
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.gray700,
  },
  conductorDNI: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  rutaCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  mapPreview: {
    marginBottom: SPACING.sm,
  },
  puntoRuta: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  puntoMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: SPACING.md,
    marginTop: 4,
  },
  puntoContent: {
    flex: 1,
  },
  puntoLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    textTransform: "uppercase",
  },
  puntoNombre: {
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.gray700,
  },
  puntoDireccion: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  rutaLinea: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.gray300,
    marginLeft: 7,
    marginVertical: SPACING.sm,
  },
  pasajerosList: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  pasajeroItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  avatarPasajero: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  avatarPasajeroText: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.white,
  },
  pasajeroInfo: {
    flex: 1,
  },
  pasajeroNombre: {
    fontSize: FONTS.md,
    fontWeight: "500",
    color: COLORS.gray700,
  },
  pasajeroDNI: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
  },
  statusIcon: {
    fontSize: FONTS.lg,
  },
  emptyPasajeros: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
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
  },
  codigoCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
  },
  codigoTexto: {
    fontSize: FONTS.xxl,
    fontWeight: "bold",
    color: COLORS.white,
    letterSpacing: 4,
  },
  codigoHint: {
    fontSize: FONTS.sm,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  tiemposCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  tiempoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  tiempoLabel: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  tiempoValue: {
    fontSize: FONTS.sm,
    color: COLORS.gray700,
    fontWeight: "500",
  },
  ubicacionesCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  ubicacionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
  },
  ubicacionTiempo: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  ubicacionCoords: {
    fontSize: FONTS.sm,
    color: COLORS.gray700,
  },
});

export default ViajeDetalleScreen;
