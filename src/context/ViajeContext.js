// YouConnext - Viaje Context
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import apiService from "../services/api";
import { GPS_CONFIG, VIAJE_ESTADO } from "../constants";
import { useUser } from "./UserContext";

const ViajeContext = createContext();

export const ViajeProvider = ({ children }) => {
  const { user } = useUser();
  const [viajeActivo, setViajeActivo] = useState(null);
  const [pasajeros, setPasajeros] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [trackingActivo, setTrackingActivo] = useState(false);
  const [distanciaTotal, setDistanciaTotal] = useState(0);
  const locationSubscription = useRef(null);
  const ubicacionesPendientes = useRef([]);

  // Cargar viaje activo desde AsyncStorage
  useEffect(() => {
    loadViajeActivo();
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  // Cargar viaje activo
  const loadViajeActivo = async () => {
    try {
      const viajeData = await AsyncStorage.getItem("@youconnext_viaje_activo");
      if (viajeData) {
        const parsed = JSON.parse(viajeData);
        setViajeActivo(parsed.viaje);
        setPasajeros(parsed.pasajeros || []);
        setUbicaciones(parsed.ubicaciones || []);

        // Si el viaje estaba activo, reanudar tracking
        if (parsed.viaje?.estado === VIAJE_ESTADO.ACTIVO) {
          iniciarTracking();
        }
      }
    } catch (error) {
      console.error("Error al cargar viaje activo:", error);
    }
  };

  // Guardar viaje activo
  const saveViajeActivo = async (viaje, pasajeroList, ubicacionList) => {
    try {
      const data = {
        viaje,
        pasajeros: pasajeroList,
        ubicaciones: ubicacionList,
      };
      await AsyncStorage.setItem(
        "@youconnext_viaje_activo",
        JSON.stringify(data),
      );
    } catch (error) {
      console.error("Error al guardar viaje activo:", error);
    }
  };

  // Crear viaje rápido
  const crearViajeRapido = async (datos) => {
    try {
      const response = await apiService.crearViaje(datos);
      setViajeActivo(response.viaje);
      setPasajeros(response.viaje.pasajeros || []);
      setUbicaciones([]);
      setDistanciaTotal(0);
      await saveViajeActivo(response.viaje, [], []);
      return response;
    } catch (error) {
      console.error("Error al crear viaje:", error);
      throw error;
    }
  };

  // Iniciar viaje
  const iniciarViaje = async () => {
    if (!viajeActivo) return;

    try {
      const response = await apiService.iniciarViaje(viajeActivo.id);
      setViajeActivo(response.viaje);
      await saveViajeActivo(response.viaje, pasajeros, ubicaciones);

      // Iniciar tracking GPS
      await iniciarTracking();

      return response;
    } catch (error) {
      console.error("Error al iniciar viaje:", error);
      throw error;
    }
  };

  // Completar viaje
  const completarViaje = async () => {
    if (!viajeActivo) return;

    try {
      await stopTracking();

      // Enviar ubicaciones pendientes
      if (ubicacionesPendientes.current.length > 0) {
        await apiService.registrarUbicacionesBatch(
          ubicacionesPendientes.current,
        );
        ubicacionesPendientes.current = [];
      }

      // Calcular distancia final
      const distancia = await apiService.calcularDistancia(viajeActivo.id);
      setDistanciaTotal(distancia.distanciaKm);

      const response = await apiService.completarViaje(
        viajeActivo.id,
        distancia.distanciaKm,
      );

      // Limpiar
      await AsyncStorage.removeItem("@youconnext_viaje_activo");
      setViajeActivo(null);
      setPasajeros([]);
      setUbicaciones([]);
      setDistanciaTotal(0);

      return response;
    } catch (error) {
      console.error("Error al completar viaje:", error);
      throw error;
    }
  };

  // Cancelar viaje
  const cancelarViaje = async () => {
    if (!viajeActivo) return;

    try {
      await stopTracking();

      const response = await apiService.cancelarViaje(viajeActivo.id);

      // Limpiar
      await AsyncStorage.removeItem("@youconnext_viaje_activo");
      setViajeActivo(null);
      setPasajeros([]);
      setUbicaciones([]);
      setDistanciaTotal(0);

      return response;
    } catch (error) {
      console.error("Error al cancelar viaje:", error);
      throw error;
    }
  };

  // Unirse a un viaje via QR
  const unirseViajeQR = async (codigoQR, usuarioDNI) => {
    try {
      const response = await apiService.unirseViaje(codigoQR, usuarioDNI);
      return response;
    } catch (error) {
      console.error("Error al unirse al viaje:", error);
      throw error;
    }
  };

  // Iniciar tracking GPS
  const iniciarTracking = async () => {
    try {
      // Solicitar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permiso de ubicación denegado");
      }

      let servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          // ignore
        }
        servicesEnabled = await Location.hasServicesEnabledAsync();
      }

      if (!servicesEnabled) {
        throw new Error("Servicios de ubicación desactivados");
      }

      setTrackingActivo(true);

      // Suscribirse a actualizaciones de ubicación
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: GPS_CONFIG.TRACKING_INTERVAL,
          distanceInterval: GPS_CONFIG.MIN_DISTANCE,
        },
        (location) => {
          registrarUbicacion(location);
        },
      );
    } catch (error) {
      console.error("Error al iniciar tracking:", error);
      setTrackingActivo(false);
      throw error;
    }
  };

  // Detener tracking GPS
  const stopTracking = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setTrackingActivo(false);
  };

  // Registrar ubicación
  const registrarUbicacion = async (location) => {
    if (!viajeActivo || !user) return;

    const ubicacion = {
      viajeId: viajeActivo.id,
      usuarioDNI: user.dni,
      latitud: location.coords.latitude,
      longitud: location.coords.longitude,
      precision: location.coords.accuracy,
      velocidad: location.coords.speed,
      altitud: location.coords.altitude,
    };

    // Guardar localmente
    setUbicaciones((prev) => [...prev, ubicacion]);

    // Agregar a pendientes para enviar al backend
    ubicacionesPendientes.current.push(ubicacion);

    // Enviar al backend (no bloqueante)
    try {
      await apiService.registrarUbicacion(ubicacion);
      // Remover de pendientes si se envió correctamente
      ubicacionesPendientes.current = ubicacionesPendientes.current.filter(
        (u) =>
          !(
            u.latitud === ubicacion.latitud && u.longitud === ubicacion.longitud
          ),
      );
    } catch (error) {
      console.log("Ubicación guardada localmente, se enviará después");
    }
  };

  // Obtener ubicación actual
  const getUbicacionActual = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permiso de ubicación denegado");
      }

      let servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          // ignore
        }
        servicesEnabled = await Location.hasServicesEnabledAsync();
      }

      if (!servicesEnabled) {
        throw new Error("Servicios de ubicación desactivados");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return location;
    } catch (error) {
      console.error("Error al obtener ubicación:", error);
      throw error;
    }
  };

  const value = {
    viajeActivo,
    pasajeros,
    ubicaciones,
    trackingActivo,
    distanciaTotal,
    crearViajeRapido,
    iniciarViaje,
    completarViaje,
    cancelarViaje,
    unirseViajeQR,
    iniciarTracking,
    stopTracking,
    getUbicacionActual,
    refreshViaje: loadViajeActivo,
  };

  return (
    <ViajeContext.Provider value={value}>{children}</ViajeContext.Provider>
  );
};

export const useViaje = () => {
  const context = useContext(ViajeContext);
  if (!context) {
    throw new Error("useViaje debe ser usado dentro de ViajeProvider");
  }
  return context;
};

export default ViajeContext;
