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
import {
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Car,
  User,
  MapPin,
  Users,
  BarChart3,
  Link2,
  Timer,
  Navigation as NavIcon,
  Radio,
  ChevronRight,
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
import { Button, TripMapPreview } from "../components";
import { trayectoService } from "../services/travels/trayectoService";

const ViajeDetalleScreen = ({ route, navigation }) => {
  const { viaje: viajeInicial, id: idDirecto } = route.params || {};
  const targetId = idDirecto || viajeInicial?.id;
  const { user } = useUser();
  const {
    viajeActivo,
    pasajeros,
    ubicaciones,
    trackingActivo,
    distanciaTotal,
    iniciarViaje,
    completarViaje,
  } = useViaje();

  const [viaje, setViaje] = useState(viajeInicial);
  const [loading, setLoading] = useState(!viajeInicial && !!targetId);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (targetId) {
      cargarDetalleViaje();
    }
  }, [targetId]);

  const cargarDetalleViaje = async () => {
    setLoading(true);
    try {
      const detalle = await trayectoService.obtenerTrayectoPorId(targetId);
      setViaje(detalle);
    } catch (error) {
      console.log("Error al cargar detalle:", error);
      Alert.alert("Error", "No se pudo obtener el detalle de este trayecto.");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = () => {
    const estado = (viaje?.status || viaje?.estado || "").toLowerCase();
    switch (estado) {
      case "pendiente":
      case "pendiente_pago":
      case VIAJE_ESTADO.PENDIENTE:
        return COLORS.warning;
      case "activo":
      case "en curso":
      case "en_curso":
      case VIAJE_ESTADO.ACTIVO:
        return COLORS.success;
      case "finalizado":
      case "completado":
      case VIAJE_ESTADO.COMPLETADO:
        return COLORS.gray400;
      case "cancelado":
      case VIAJE_ESTADO.CANCELADO:
        return COLORS.error;
      default:
        return COLORS.gray400;
    }
  };

  const getEstadoTexto = () => {
    const estado = (viaje?.status || viaje?.estado || "").toLowerCase();
    switch (estado) {
      case "pendiente":
      case "pendiente_pago":
      case VIAJE_ESTADO.PENDIENTE:
        return "Pendiente";
      case "activo":
      case "en curso":
      case "en_curso":
      case VIAJE_ESTADO.ACTIVO:
        return "En curso";
      case "finalizado":
      case "completado":
      case VIAJE_ESTADO.COMPLETADO:
        return "Completado";
      case "cancelado":
      case VIAJE_ESTADO.CANCELADO:
        return "Cancelado";
      default:
        return estado
          ? estado.charAt(0).toUpperCase() + estado.slice(1)
          : "Desconocido";
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

  const esConductor =
    user?.id ===
    (viaje?.conductor_id || viaje?.conductorId || viaje?.conductor);

  const estadoViaje = (viaje?.status || viaje?.estado || "").toLowerCase();
  const puedeIniciar =
    esConductor &&
    (estadoViaje === "pendiente" ||
      estadoViaje === "programado" ||
      estadoViaje === "pendiente_pago");
  const puedeFinalizar =
    esConductor &&
    (estadoViaje === "activo" ||
      estadoViaje === "en curso" ||
      estadoViaje === "en_curso");
  const estaEnCurso =
    estadoViaje === "activo" ||
    estadoViaje === "en curso" ||
    estadoViaje === "en_curso";

  const handleIniciarViaje = async () => {
    setActionLoading(true);
    try {
      await iniciarViaje(viaje);
      const viajeActualizado = { ...viaje, status: "en curso" };
      setViaje(viajeActualizado);
      Alert.alert(
        "Viaje iniciado",
        "El tracking GPS está activo. ¡Buen viaje!",
        [
          {
            text: "Ver recorrido",
            onPress: () =>
              navigation.navigate("ViajeEnCurso", { viaje: viajeActualizado }),
          },
          { text: "OK" },
        ],
      );
    } catch (e) {
      Alert.alert("Error", e?.message || "No se pudo iniciar el viaje.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizarViaje = async () => {
    Alert.alert(
      "Finalizar viaje",
      "¿Estás seguro de que quieres finalizar este trayecto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await completarViaje(viaje);
              setViaje({ ...viaje, status: "finalizado" });
              Alert.alert(
                "Viaje finalizado",
                "El trayecto se ha completado correctamente.",
                [{ text: "OK", onPress: () => navigation.goBack() }],
              );
            } catch (e) {
              Alert.alert(
                "Error",
                e?.message || "No se pudo finalizar el viaje.",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  if (loading && !viaje) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={COLORS.gray800} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del viaje</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Cargando detalle del trayecto...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!viaje && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={COLORS.gray800} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del viaje</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            No se pudo cargar la información de este trayecto.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const origen =
    viaje?.origen_lat != null && viaje?.origen_lng != null
      ? {
          latitude: viaje.origen_lat,
          longitude: viaje.origen_lng,
          name: viaje?.origen || "Origen",
        }
      : viaje?.puntoInicialLat != null && viaje?.puntoInicialLng != null
        ? {
            latitude: viaje.puntoInicialLat,
            longitude: viaje.puntoInicialLng,
            name: viaje?.puntoInicialNombre || "Origen",
          }
        : null;

  const destino =
    viaje?.destino_lat != null && viaje?.destino_lng != null
      ? {
          latitude: viaje.destino_lat,
          longitude: viaje.destino_lng,
          name: viaje?.destino || "Destino",
        }
      : viaje?.puntoFinalLat != null && viaje?.puntoFinalLng != null
        ? {
            latitude: viaje.puntoFinalLat,
            longitude: viaje.puntoFinalLng,
            name: viaje?.puntoFinalNombre || "Destino",
          }
        : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.gray800} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del viaje</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado del viaje */}
        <View
          style={[styles.estadoCard, { backgroundColor: getEstadoColor() }]}
        >
          <Text style={styles.estadoTexto}>{getEstadoTexto()}</Text>
          {trackingActivo && (
            <View style={styles.trackingRow}>
              <Radio size={12} color={COLORS.white} strokeWidth={2.5} />
              <Text style={styles.trackingText}>GPS activo</Text>
            </View>
          )}
        </View>

        {/* Matricula y vehiculo */}
        <View style={styles.vehiculoSection}>
          <View style={styles.vehiculoIcon}>
            <Car size={28} color={COLORS.primary} strokeWidth={2} />
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
          <View style={styles.sectionTitleRow}>
            <User size={18} color={COLORS.gray700} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Conductor</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.avatarConductor}>
              <Text style={styles.avatarText}>
                {typeof viaje?.conductor === "object"
                  ? viaje?.conductor?.nombre?.charAt(0) || "?"
                  : viaje?.conductor?.charAt(0) || "?"}
              </Text>
            </View>
            <View style={styles.conductorInfo}>
              <Text style={styles.conductorNombre}>
                {typeof viaje?.conductor === "object"
                  ? `${viaje?.conductor?.nombre || "Desconocido"} ${viaje?.conductor?.apellidos || ""}`
                  : viaje?.conductor || "Desconocido"}
              </Text>
              <Text style={styles.conductorDNI}>
                {typeof viaje?.conductor === "object"
                  ? viaje?.conductor?.email || "No disponible"
                  : viaje?.conductorEmail || "No disponible"}
              </Text>
            </View>
          </View>
        </View>

        {/* Ruta */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MapPin size={18} color={COLORS.gray700} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Ruta</Text>
          </View>
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
                  {viaje?.origen ||
                    viaje?.puntoInicialNombre ||
                    "Ubicación inicial"}
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
                  {viaje?.destino ||
                    viaje?.puntoFinalNombre ||
                    "Ubicación final"}
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
          <View style={styles.sectionTitleRow}>
            <Users size={18} color={COLORS.gray700} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>
              Pasajeros ({viaje?.pasajeros?.length || 0})
            </Text>
          </View>
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
                    <Text style={styles.pasajeroDNI}>{p.usuario?.email}</Text>
                  </View>
                  {p.pickedUp && (
                    <CheckCircle2
                      size={18}
                      color={COLORS.success}
                      strokeWidth={2}
                    />
                  )}
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

        {/* Estadisticas */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <BarChart3 size={18} color={COLORS.gray700} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Estadisticas</Text>
          </View>
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

        {/* Codigo QR */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Link2 size={18} color={COLORS.gray700} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Codigo para unirse</Text>
          </View>
          <View style={styles.codigoCard}>
            <Text style={styles.codigoTexto}>{viaje?.codigoQR}</Text>
            <Text style={styles.codigoHint}>
              Compártelo con los pasajeros para que se unan al viaje
            </Text>
          </View>
        </View>

        {/* Tiempos */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Timer size={18} color={COLORS.gray700} strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Tiempos</Text>
          </View>
          <View style={styles.tiemposCard}>
            {(viaje?.hora || viaje?.fecha) && (
              <View style={styles.tiempoRow}>
                <Text style={styles.tiempoLabel}>Salida Programada</Text>
                <Text style={styles.tiempoValue}>
                  {formatDate(viaje.hora || viaje.fecha)}
                </Text>
              </View>
            )}
            {viaje?.createdAt && (
              <View style={styles.tiempoRow}>
                <Text style={styles.tiempoLabel}>Creado</Text>
                <Text style={styles.tiempoValue}>
                  {formatDate(viaje.createdAt)}
                </Text>
              </View>
            )}
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

        {/* Ubicaciones GPS (ultimas) */}
        {ubicaciones.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <NavIcon size={18} color={COLORS.gray700} strokeWidth={2.5} />
              <Text style={styles.sectionTitle}>Ultimas ubicaciones</Text>
            </View>
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

        {/* Acciones del conductor */}
        {esConductor && (
          <View style={styles.conductorActions}>
            {puedeIniciar && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleIniciarViaje}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <Play size={20} color={COLORS.white} strokeWidth={2.5} />
                <Text style={styles.actionButtonText}>
                  {actionLoading ? "Iniciando..." : "Iniciar trayecto"}
                </Text>
              </TouchableOpacity>
            )}

            {puedeFinalizar && (
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonFinalizar]}
                onPress={handleFinalizarViaje}
                disabled={actionLoading}
                activeOpacity={0.8}
              >
                <CheckCircle2
                  size={20}
                  color={COLORS.white}
                  strokeWidth={2.5}
                />
                <Text style={styles.actionButtonText}>
                  {actionLoading ? "Finalizando..." : "Finalizar trayecto"}
                </Text>
              </TouchableOpacity>
            )}

            {estaEnCurso && (
              <TouchableOpacity
                style={styles.verRecorridoButton}
                onPress={() => navigation.navigate("ViajeEnCurso", { viaje })}
                activeOpacity={0.8}
              >
                <NavIcon size={18} color={COLORS.primary} strokeWidth={2.5} />
                <Text style={styles.verRecorridoText}>
                  Ver recorrido en vivo
                </Text>
                <ChevronRight
                  size={16}
                  color={COLORS.primary}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            )}
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
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
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
    color: COLORS.gray800,
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
  vehiculoIconText: {
    fontSize: 30,
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.gray600,
    marginTop: SPACING.md,
    fontWeight: "500",
  },
  errorText: {
    fontSize: FONTS.md,
    color: COLORS.error,
    textAlign: "center",
  },
  conductorActions: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    ...SHADOWS.medium,
  },
  actionButtonFinalizar: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.white,
  },
  verRecorridoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
  },
  verRecorridoText: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
});

export default ViajeDetalleScreen;
