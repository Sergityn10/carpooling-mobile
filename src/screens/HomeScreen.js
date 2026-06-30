// YouConnext - HomeScreen
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  ScanLine,
  Search,
  BarChart3,
  Settings,
  History,
  Car,
  MapPin,
  Clock,
  ChevronRight,
  CalendarDays,
} from "lucide-react-native";
import { useUser } from "../context/UserContext";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../constants";
import { SearchBottomSheet, ViajeCard } from "../components";
import { trayectoService } from "../services/travels/trayectoService";

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const [searchSheetVisible, setSearchSheetVisible] = useState(false);
  const [proximosViajes, setProximosViajes] = useState([]);
  const [loadingProximos, setLoadingProximos] = useState(false);

  const handleSearch = (params) => {
    navigation.navigate("SearchTrayectos", { searchParams: params });
  };

  const handleUnirseViaje = () => {
    navigation.navigate("EscanearQR");
  };

  const fetchProximosViajes = useCallback(async () => {
    setLoadingProximos(true);
    try {
      const res = await trayectoService.obtenerProximosTrayectos();
      const data = Array.isArray(res) ? res : [];
      setProximosViajes(data);
    } catch (err) {
      console.warn("Error al cargar próximos viajes:", err.message);
      setProximosViajes([]);
    } finally {
      setLoadingProximos(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProximosViajes();
    }, [fetchProximosViajes]),
  );

  const formatHora = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFecha = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);

    if (date.toDateString() === hoy.toDateString()) return "Hoy";
    if (date.toDateString() === manana.toDateString()) return "Mañana";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.saludo}>
            {user ? `Hola, ${user.name}` : "Hola"}
          </Text>
          <Text style={styles.subtitulo}>A donde vamos hoy?</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.qrButton} onPress={handleUnirseViaje}>
            <ScanLine size={22} color={COLORS.primary} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.perfilButton}
            onPress={() => navigation.navigate("Perfil")}
          >
            <Text style={styles.perfilInicial}>
              {user?.nombre?.charAt(0) || "?"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Input de busqueda accionable */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => setSearchSheetVisible(true)}
          activeOpacity={0.7}
        >
          <Search size={20} color={COLORS.gray400} strokeWidth={2.5} />
          <Text style={styles.searchPlaceholder}>Establece tu destino</Text>
        </TouchableOpacity>

        {/* Crear viaje */}
        <View style={styles.crearViajeSection}>
          <View style={styles.crearViajeCard}>
            <View style={styles.crearViajeIconRow}>
              <Car size={32} color={COLORS.white} strokeWidth={2} />
            </View>
            <Text style={styles.crearViajeTitle}>Tienes un viaje ahora?</Text>
            <Text style={styles.crearViajeSubtitle}>
              Crea un viaje rapido y comparte tu ubicacion con los pasajeros
            </Text>
            <TouchableOpacity
              style={styles.crearViajeButton}
              onPress={() => navigation.navigate("CrearViaje")}
            >
              <Text style={styles.crearViajeButtonText}>Crear viaje</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Próximos viajes */}
        <View style={styles.proximosSection}>
          <View style={styles.proximosHeader}>
            <View style={styles.proximosTitleRow}>
              <CalendarDays
                size={20}
                color={COLORS.primary}
                strokeWidth={2.5}
              />
              <Text style={styles.proximosTitle}>Próximos viajes</Text>
            </View>
            {proximosViajes.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate("Perfil")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={styles.verTodosRow}>
                  <Text style={styles.verTodosText}>Ver todos</Text>
                  <ChevronRight
                    size={16}
                    color={COLORS.primary}
                    strokeWidth={2.5}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {loadingProximos ? (
            <View style={styles.proximosLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.proximosLoadingText}>Cargando...</Text>
            </View>
          ) : proximosViajes.length === 0 ? (
            <View style={styles.proximosEmpty}>
              <Car size={32} color={COLORS.gray300} strokeWidth={1.5} />
              <Text style={styles.proximosEmptyText}>
                No tienes viajes próximos en las próximas 48 horas
              </Text>
            </View>
          ) : (
            proximosViajes.slice(0, 3).map((viaje) => (
              <TouchableOpacity
                key={viaje.id}
                style={styles.proximoCard}
                onPress={() => navigation.navigate("ViajeDetalle", { viaje })}
                activeOpacity={0.8}
              >
                <View style={styles.proximoCardLeft}>
                  <View style={styles.proximoDateBadge}>
                    <Text style={styles.proximoDateDay}>
                      {formatFecha(viaje.hora)}
                    </Text>
                    <Text style={styles.proximoDateTime}>
                      {formatHora(viaje.hora)}
                    </Text>
                  </View>
                </View>
                <View style={styles.proximoCardContent}>
                  <View style={styles.proximoRoute}>
                    <View style={styles.proximoPoint}>
                      <MapPin
                        size={14}
                        color={COLORS.success}
                        strokeWidth={2.5}
                      />
                      <Text style={styles.proximoPointText} numberOfLines={1}>
                        {viaje.origen || "Origen"}
                      </Text>
                    </View>
                    <View style={styles.proximoRouteLine} />
                    <View style={styles.proximoPoint}>
                      <MapPin
                        size={14}
                        color={COLORS.error}
                        strokeWidth={2.5}
                      />
                      <Text style={styles.proximoPointText} numberOfLines={1}>
                        {viaje.destino || "Destino"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.proximoCardFooter}>
                    <View style={styles.proximoConductor}>
                      {viaje.img_perfil ? (
                        <Image
                          source={{ uri: viaje.img_perfil }}
                          style={styles.proximoAvatar}
                        />
                      ) : (
                        <View style={styles.proximoAvatarFallback}>
                          <Text style={styles.proximoAvatarText}>
                            {viaje.conductor?.charAt(0)?.toUpperCase() || "?"}
                          </Text>
                        </View>
                      )}
                      <Text
                        style={styles.proximoConductorName}
                        numberOfLines={1}
                      >
                        {viaje.conductor || "Conductor"}
                      </Text>
                    </View>
                    {viaje.precio != null && (
                      <Text style={styles.proximoPrice}>{viaje.precio} €</Text>
                    )}
                  </View>
                </View>
                <ChevronRight
                  size={20}
                  color={COLORS.gray300}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Acceso rapido */}
        <View style={styles.accesosRapidos}>
          <TouchableOpacity
            style={styles.accesoItem}
            onPress={() => navigation.navigate("Historial")}
          >
            <View style={styles.accesoIconBg}>
              <History size={22} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={styles.accesoLabel}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accesoItem}
            onPress={() => navigation.navigate("Estadisticas")}
          >
            <View style={styles.accesoIconBg}>
              <BarChart3 size={22} color={COLORS.secondary} strokeWidth={2} />
            </View>
            <Text style={styles.accesoLabel}>Estadisticas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accesoItem}
            onPress={() => navigation.navigate("Ajustes")}
          >
            <View style={styles.accesoIconBg}>
              <Settings size={22} color={COLORS.gray600} strokeWidth={2} />
            </View>
            <Text style={styles.accesoLabel}>Ajustes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Search Bottom Sheet */}
      <SearchBottomSheet
        visible={searchSheetVisible}
        onClose={() => setSearchSheetVisible(false)}
        onSearch={handleSearch}
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  saludo: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.gray800,
  },
  subtitulo: {
    fontSize: FONTS.md,
    color: COLORS.gray500,
    marginTop: 2,
  },
  qrButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  perfilButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.small,
  },
  searchPlaceholder: {
    fontSize: FONTS.md,
    color: COLORS.gray400,
  },
  crearViajeSection: {
    marginBottom: SPACING.xl,
  },
  crearViajeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.large,
  },
  crearViajeIconRow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
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
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  crearViajeButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: FONTS.md,
  },
  proximosSection: {
    marginBottom: SPACING.xl,
  },
  proximosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  proximosTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  proximosTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray800,
  },
  verTodosRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  verTodosText: {
    fontSize: FONTS.sm,
    color: COLORS.primary,
    fontWeight: "600",
  },
  proximosLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  proximosLoadingText: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  proximosEmpty: {
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  proximosEmptyText: {
    fontSize: FONTS.sm,
    color: COLORS.gray400,
    textAlign: "center",
  },
  proximoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  proximoCardLeft: {
    marginRight: SPACING.md,
  },
  proximoDateBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    minWidth: 60,
  },
  proximoDateDay: {
    fontSize: FONTS.xs,
    fontWeight: "bold",
    color: COLORS.primary,
    textTransform: "capitalize",
  },
  proximoDateTime: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 2,
  },
  proximoCardContent: {
    flex: 1,
  },
  proximoRoute: {
    marginBottom: SPACING.sm,
  },
  proximoPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  proximoPointText: {
    fontSize: FONTS.sm,
    color: COLORS.gray700,
    flex: 1,
  },
  proximoRouteLine: {
    width: 2,
    height: 12,
    backgroundColor: COLORS.gray300,
    marginLeft: 6,
    marginVertical: 2,
  },
  proximoCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  proximoConductor: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flex: 1,
  },
  proximoAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  proximoAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  proximoAvatarText: {
    fontSize: FONTS.xs,
    fontWeight: "bold",
    color: COLORS.white,
  },
  proximoConductorName: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    flex: 1,
  },
  proximoPrice: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.gray700,
  },
  accesosRapidos: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SPACING.xl,
  },
  accesoItem: {
    alignItems: "center",
  },
  accesoIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
    ...SHADOWS.small,
  },
  accesoLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray600,
    fontWeight: "500",
  },
});

export default HomeScreen;
