// YouConnext - HomeScreen
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useUser } from "../context/UserContext";
import { useViaje } from "../context/ViajeContext";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../constants";
import { Button, ViajeCard, QRCodeModal } from "../components";
import PlaceAutocompleteInput from "../components/PlaceAutocompleteInput";
import TripMapPreview from "../components/TripMapPreview";
import apiService from "../services/api";

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const {
    viajeActivo,
    crearViajeRapido,
    iniciarViaje,
    completarViaje,
    cancelarViaje,
    getUbicacionActual,
    trackingActivo,
    distanciaTotal,
  } = useViaje();

  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [viajeCreado, setViajeCreado] = useState(null);
  const [viajesRecientes, setViajesRecientes] = useState([]);
  const [crearViajeModalVisible, setCrearViajeModalVisible] = useState(false);
  const [origenTexto, setOrigenTexto] = useState("");
  const [origenPlace, setOrigenPlace] = useState(null);
  const [destinoTexto, setDestinoTexto] = useState("");
  const [destinoPlace, setDestinoPlace] = useState(null);

  useEffect(() => {
    obtenerUbicacionActual();
    cargarViajesRecientes();
  }, []);

  const obtenerUbicacionActual = async () => {
    try {
      setLoadingLocation(true);
      const location = await getUbicacionActual();
      setUbicacionActual(location.coords);

      if (!origenPlace) {
        const coords = location.coords;
        let nombre = "Mi ubicación";
        let direccion;

        try {
          const reversed = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          const first = reversed?.[0];
          if (first) {
            const parts = [
              first.street,
              first.streetNumber,
              first.city,
              first.region,
            ].filter(Boolean);
            direccion = parts.join(" ");
            if (first.name) nombre = first.name;
          }
        } catch {
          // ignore
        }

        setOrigenPlace({
          latitude: coords.latitude,
          longitude: coords.longitude,
          name: nombre,
          address: direccion,
        });
        setOrigenTexto(direccion || nombre);
      }
    } catch (error) {
      console.log("Error al obtener ubicación:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const cargarViajesRecientes = async () => {
    try {
      const viajes = await apiService.listarViajesActivos();
      setViajesRecientes(viajes.slice(0, 5));
    } catch (error) {
      console.log("Error al cargar viajes:", error);
    }
  };

  const crearViajeConOrigenDestino = async () => {
    if (
      !origenPlace?.latitude ||
      !origenPlace?.longitude ||
      !destinoPlace?.latitude ||
      !destinoPlace?.longitude
    ) {
      Alert.alert(
        "Faltan datos",
        "Selecciona un origen y un destino de la lista para obtener sus coordenadas.",
      );
      return;
    }

    const response = await crearViajeRapido({
      conductorDNI: user.dni,
      matricula: "1234ABC",
      modeloVehiculo: "Seat León",
      colorVehiculo: "Blanco",
      puntoInicialLat: origenPlace.latitude,
      puntoInicialLng: origenPlace.longitude,
      puntoInicialNombre: origenPlace.name || "Origen",
      puntoInicialDireccion: origenPlace.address,
      puntoFinalLat: destinoPlace.latitude,
      puntoFinalLng: destinoPlace.longitude,
      puntoFinalNombre: destinoPlace.name || destinoTexto || "Destino",
      puntoFinalDireccion: destinoPlace.address,
    });

    setViajeCreado(response.viaje);
    setShowQRModal(true);
  };

  const handleCrearViajeRapido = async () => {
    if (!ubicacionActual) {
      Alert.alert(
        "Ubicación requerida",
        "Necesitamos tu ubicación para crear un viaje.",
      );
      return;
    }

    if (!user) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para crear un viaje.");
      return;
    }

    try {
      setDestinoTexto("");
      setDestinoPlace(null);
      setCrearViajeModalVisible(true);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo crear el viaje. Intenta de nuevo.",
      );
    }
  };

  const handleIniciarViaje = async () => {
    try {
      const response = await iniciarViaje();
      navigation.navigate("ViajeEnCurso", {
        viaje: response?.viaje || viajeActivo,
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo iniciar el viaje.");
    }
  };

  const handleCompletarViaje = async () => {
    Alert.alert(
      "Completar viaje",
      "¿Estás seguro de que quieres completar el viaje?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Completar",
          onPress: async () => {
            try {
              await completarViaje();
              Alert.alert(
                "¡Viaje completado!",
                `Distancia recorrida: ${distanciaTotal.toFixed(2)} km`,
              );
            } catch (error) {
              Alert.alert("Error", "No se pudo completar el viaje.");
            }
          },
        },
      ],
    );
  };

  const handleCancelarViaje = async () => {
    Alert.alert(
      "Cancelar viaje",
      "¿Estás seguro de que quieres cancelar el viaje?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelarViaje();
              Alert.alert("Viaje cancelado");
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar el viaje.");
            }
          },
        },
      ],
    );
  };

  const handleUnirseViaje = () => {
    navigation.navigate("EscanearQR");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.saludo}>
            {user ? `¡Hola, ${user.nombre}! 👋` : "¡Hola!"}
          </Text>
          <Text style={styles.subtitulo}>¿A dónde vamos hoy?</Text>
        </View>
        <TouchableOpacity
          style={styles.perfilButton}
          onPress={() => navigation.navigate("Perfil")}
        >
          <Text style={styles.perfilInicial}>
            {user?.nombre?.charAt(0) || "?"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estado de ubicación */}
        <View style={styles.locationStatus}>
          <View style={styles.locationIcon}>
            <Text>📍</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Ubicación actual</Text>
            {loadingLocation ? (
              <Text style={styles.locationText}>Obteniendo...</Text>
            ) : ubicacionActual ? (
              <Text style={styles.locationText}>
                {ubicacionActual.latitude.toFixed(4)},{" "}
                {ubicacionActual.longitude.toFixed(4)}
              </Text>
            ) : (
              <Text style={styles.locationTextError}>Sin ubicación</Text>
            )}
          </View>
          <TouchableOpacity onPress={obtenerUbicacionActual}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Viaje activo o crear viaje */}
        {viajeActivo ? (
          <View style={styles.viajeActivoSection}>
            <View style={styles.viajeActivoHeader}>
              <Text style={styles.viajeActivoTitle}>🚗 Viaje activo</Text>
              {trackingActivo && (
                <View style={styles.trackingBadge}>
                  <Text style={styles.trackingBadgeText}>
                    📡 Tracking activo
                  </Text>
                </View>
              )}
            </View>

            <ViajeCard
              viaje={viajeActivo}
              onPress={() =>
                navigation.navigate("ViajeDetalle", { viaje: viajeActivo })
              }
            />

            <View style={styles.viajeActivoActions}>
              {viajeActivo.estado === "pendiente" && (
                <Button
                  title="🚀 Iniciar viaje"
                  onPress={handleIniciarViaje}
                  variant="primary"
                  size="large"
                  style={styles.actionButton}
                />
              )}
              {viajeActivo.estado === "activo" && (
                <Button
                  title="✅ Completar viaje"
                  onPress={handleCompletarViaje}
                  variant="primary"
                  size="large"
                  style={styles.actionButton}
                />
              )}
              <Button
                title="❌ Cancelar"
                onPress={handleCancelarViaje}
                variant="outline"
                size="medium"
                style={styles.cancelButton}
              />
            </View>

            {trackingActivo && (
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {distanciaTotal.toFixed(2)}
                  </Text>
                  <Text style={styles.statLabel}>km</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {viajeActivo.pasajeros?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>pasajeros</Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.crearViajeSection}>
            <View style={styles.crearViajeCard}>
              <Text style={styles.crearViajeTitle}>
                ¿Tienes un viaje ahora?
              </Text>
              <Text style={styles.crearViajeSubtitle}>
                Crea un viaje rápido y comparte tu ubicación con los pasajeros
              </Text>
              <Button
                title="🚗 Crear viaje rápido"
                onPress={handleCrearViajeRapido}
                variant="primary"
                size="large"
                style={styles.crearViajeButton}
              />
            </View>
          </View>
        )}

        {/* Sección de escanear QR */}
        <View style={styles.escanearSection}>
          <TouchableOpacity
            style={styles.escanearCard}
            onPress={handleUnirseViaje}
          >
            <View style={styles.escanearIcon}>
              <Text>📱</Text>
            </View>
            <View style={styles.escanearInfo}>
              <Text style={styles.escanearTitle}>Escanear QR</Text>
              <Text style={styles.escanearSubtitle}>
                Únete a un viaje existente
              </Text>
            </View>
            <Text style={styles.escanearArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Viajes recientes */}
        {viajesRecientes.length > 0 && (
          <View style={styles.viajesRecientesSection}>
            <Text style={styles.sectionTitle}>🔥 Viajes activos cerca</Text>
            {viajesRecientes.map((viaje) => (
              <ViajeCard
                key={viaje.id}
                viaje={viaje}
                onPress={() => navigation.navigate("ViajeDetalle", { viaje })}
                onUnirse={handleUnirseViaje}
              />
            ))}
          </View>
        )}

        {/* Acceso rápido */}
        <View style={styles.accesosRapidos}>
          <TouchableOpacity
            style={styles.accesoItem}
            onPress={() => navigation.navigate("Historial")}
          >
            <Text style={styles.accesoIcon}>📋</Text>
            <Text style={styles.accesoLabel}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accesoItem}
            onPress={() => navigation.navigate("Estadisticas")}
          >
            <Text style={styles.accesoIcon}>📊</Text>
            <Text style={styles.accesoLabel}>Estadísticas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accesoItem}
            onPress={() => navigation.navigate("Ajustes")}
          >
            <Text style={styles.accesoIcon}>⚙️</Text>
            <Text style={styles.accesoLabel}>Ajustes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* QR Modal */}
      <QRCodeModal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        viaje={viajeCreado}
        codigoQR={viajeCreado?.codigoQR}
      />

      <Modal
        visible={crearViajeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCrearViajeModalVisible(false)}
      >
        <View style={styles.destinoOverlay}>
          <View style={styles.destinoContainer}>
            <Text style={styles.destinoTitle}>Crear viaje</Text>
            <Text style={styles.destinoSubtitle}>
              Selecciona origen y destino con autocompletado
            </Text>

            <PlaceAutocompleteInput
              label="Origen"
              placeholder="Tu ubicación"
              value={origenTexto}
              onChangeText={setOrigenTexto}
              biasLocation={ubicacionActual}
              onSelectPlace={(p) => {
                setOrigenPlace(p);
                setOrigenTexto(p.address || p.name || "");
              }}
              components="country:es"
            />

            <PlaceAutocompleteInput
              label="Destino"
              placeholder="¿A dónde vas?"
              value={destinoTexto}
              onChangeText={setDestinoTexto}
              biasLocation={ubicacionActual}
              onSelectPlace={(p) => {
                setDestinoPlace(p);
                setDestinoTexto(p.address || p.name || "");
              }}
              components="country:es"
            />

            <TripMapPreview origin={origenPlace} destination={destinoPlace} />

            <View style={styles.destinoActions}>
              <TouchableOpacity
                style={styles.destinoCancelButton}
                onPress={() => setCrearViajeModalVisible(false)}
              >
                <Text style={styles.destinoCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.destinoOkButton}
                onPress={async () => {
                  try {
                    await crearViajeConOrigenDestino();
                    setCrearViajeModalVisible(false);
                  } catch (error) {
                    Alert.alert(
                      "Error",
                      error?.message ||
                        "No se pudo crear el viaje. Intenta de nuevo.",
                    );
                  }
                }}
              >
                <Text style={styles.destinoOkText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  saludo: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.gray700,
  },
  subtitulo: {
    fontSize: FONTS.md,
    color: COLORS.gray500,
    marginTop: 2,
  },
  perfilButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  perfilInicial: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
  },
  locationText: {
    fontSize: FONTS.sm,
    color: COLORS.gray700,
    fontWeight: "500",
  },
  locationTextError: {
    fontSize: FONTS.sm,
    color: COLORS.error,
    fontWeight: "500",
  },
  refreshIcon: {
    fontSize: FONTS.xl,
  },
  viajeActivoSection: {
    marginBottom: SPACING.xl,
  },
  viajeActivoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  viajeActivoTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray700,
  },
  trackingBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  trackingBadgeText: {
    fontSize: FONTS.xs,
    color: COLORS.white,
    fontWeight: "600",
  },
  viajeActivoActions: {
    marginTop: SPACING.md,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  cancelButton: {
    borderColor: COLORS.error,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  statValue: {
    fontSize: FONTS.xxl,
    fontWeight: "bold",
    color: COLORS.white,
  },
  statLabel: {
    fontSize: FONTS.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.white,
    opacity: 0.3,
  },
  crearViajeSection: {
    marginBottom: SPACING.xl,
  },
  crearViajeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  crearViajeTitle: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  crearViajeSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  crearViajeButton: {
    backgroundColor: COLORS.white,
  },
  escanearSection: {
    marginBottom: SPACING.xl,
  },
  escanearCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  escanearIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  escanearInfo: {
    flex: 1,
  },
  escanearTitle: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.gray700,
  },
  escanearSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  escanearArrow: {
    fontSize: FONTS.xl,
    color: COLORS.primary,
  },
  viajesRecientesSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  accesosRapidos: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SPACING.xl,
  },
  accesoItem: {
    alignItems: "center",
    padding: SPACING.md,
  },
  accesoIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  accesoLabel: {
    fontSize: FONTS.sm,
    color: COLORS.gray600,
  },
  destinoOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  destinoContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  destinoTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  destinoSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
  },
  destinoInput: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.md,
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  destinoActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  destinoCancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
  },
  destinoCancelText: {
    color: COLORS.gray600,
    fontWeight: "600",
    fontSize: FONTS.sm,
  },
  destinoOkButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  destinoOkText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONTS.sm,
  },
});

export default HomeScreen;
