// YouConnext - ViajeCard Component
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Clock, CheckCircle2, XCircle, Play, Car } from "lucide-react-native";
import {
  COLORS,
  SPACING,
  RADIUS,
  FONTS,
  SHADOWS,
  VIAJE_ESTADO,
} from "../../constants";

const ViajeCard = ({ viaje, onPress, onUnirse }) => {
  const estado = viaje.status || viaje.estado;

  const getEstadoColor = () => {
    switch (estado) {
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

  const getEstadoIcon = () => {
    const iconColor = COLORS.white;
    switch (estado) {
      case VIAJE_ESTADO.PENDIENTE:
        return <Clock size={12} color={iconColor} strokeWidth={2.5} />;
      case VIAJE_ESTADO.ACTIVO:
        return <Play size={12} color={iconColor} strokeWidth={2.5} />;
      case VIAJE_ESTADO.COMPLETADO:
        return <CheckCircle2 size={12} color={iconColor} strokeWidth={2.5} />;
      case VIAJE_ESTADO.CANCELADO:
        return <XCircle size={12} color={iconColor} strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  const getEstadoTexto = () => {
    switch (estado) {
      case VIAJE_ESTADO.PENDIENTE:
        return "Pendiente";
      case VIAJE_ESTADO.ACTIVO:
        return "En curso";
      case VIAJE_ESTADO.COMPLETADO:
        return "Completado";
      case VIAJE_ESTADO.CANCELADO:
        return "Cancelado";
      default:
        return estado;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.matricula}>
            {viaje.precio != null ? `${viaje.precio} €` : "--"}
          </Text>
          <Text style={styles.modelo}>
            {viaje.disponible != null && viaje.plazas != null
              ? `${viaje.disponible}/${viaje.plazas} plazas`
              : ""}
          </Text>
        </View>
        <View
          style={[styles.estadoBadge, { backgroundColor: getEstadoColor() }]}
        >
          {getEstadoIcon()}
          <Text style={styles.estadoTexto}>{getEstadoTexto()}</Text>
        </View>
      </View>

      {/* Conductor */}
      <View style={styles.conductorSection}>
        <Text style={styles.label}>Conductor</Text>
        <View style={styles.conductorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {typeof viaje.conductor === "string"
                ? viaje.conductor.charAt(0)
                : "?"}
            </Text>
          </View>
          <Text style={styles.conductorNombre}>
            {typeof viaje.conductor === "string"
              ? viaje.conductor
              : `Conductor #${viaje.conductor || "?"}`}
          </Text>
        </View>
      </View>

      {/* Ruta */}
      <View style={styles.rutaSection}>
        <View style={styles.punto}>
          <View
            style={[styles.puntoMarker, { backgroundColor: COLORS.success }]}
          />
          <View style={styles.puntoInfo}>
            <Text style={styles.puntoLabel}>Inicio</Text>
            <Text style={styles.puntoTexto} numberOfLines={1}>
              {viaje.origen || "Ubicación inicial"}
            </Text>
          </View>
        </View>
        <View style={styles.rutaLinea} />
        <View style={styles.punto}>
          <View
            style={[styles.puntoMarker, { backgroundColor: COLORS.error }]}
          />
          <View style={styles.puntoInfo}>
            <Text style={styles.puntoLabel}>Destino</Text>
            <Text style={styles.puntoTexto} numberOfLines={1}>
              {viaje.destino || "Ubicación final"}
            </Text>
          </View>
        </View>
      </View>

      {/* Preferencias del conductor */}
      {viaje.driverPreferences && (
        <View style={styles.preferenciasSection}>
          <Text style={styles.label}>Preferencias</Text>
          <View style={styles.preferenciasLista}>
            {viaje.driverPreferences.music && (
              <View style={styles.preferenciaBadge}>
                <Text style={styles.preferenciaTexto}>🎵 Música</Text>
              </View>
            )}
            {viaje.driverPreferences.smoking && (
              <View style={styles.preferenciaBadge}>
                <Text style={styles.preferenciaTexto}>🚬 Fumar</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.fecha}>{formatDate(viaje.hora)}</Text>
        {viaje.disponible != null && viaje.plazas != null && (
          <Text style={styles.distancia}>{viaje.disponible} plazas libres</Text>
        )}
      </View>

      {/* Boton de unirse (solo para viajes pendientes) */}
      {estado === VIAJE_ESTADO.PENDIENTE && onUnirse && (
        <TouchableOpacity style={styles.unirseButton} onPress={onUnirse}>
          <Car size={18} color={COLORS.white} strokeWidth={2.5} />
          <Text style={styles.unirseButtonText}>Unirse al viaje</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  headerLeft: {
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
    marginTop: 2,
  },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  estadoTexto: {
    fontSize: FONTS.xs,
    color: COLORS.white,
    fontWeight: "600",
  },
  conductorSection: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
  },
  conductorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONTS.sm,
  },
  conductorNombre: {
    fontSize: FONTS.md,
    color: COLORS.gray700,
  },
  rutaSection: {
    marginBottom: SPACING.md,
  },
  punto: {
    flexDirection: "row",
    alignItems: "center",
  },
  puntoMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  puntoInfo: {
    flex: 1,
  },
  puntoLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
  },
  puntoTexto: {
    fontSize: FONTS.md,
    color: COLORS.gray700,
  },
  rutaLinea: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.gray300,
    marginLeft: 5,
    marginVertical: 4,
  },
  preferenciasSection: {
    marginBottom: SPACING.md,
  },
  preferenciasLista: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  preferenciaBadge: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  preferenciaTexto: {
    fontSize: FONTS.xs,
    color: COLORS.gray600,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.sm,
  },
  fecha: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  distancia: {
    fontSize: FONTS.sm,
    color: COLORS.accent,
    fontWeight: "600",
  },
  unirseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
  },
  unirseButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONTS.md,
  },
});

export default ViajeCard;
