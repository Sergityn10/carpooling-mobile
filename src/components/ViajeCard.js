// YouConnext - ViajeCard Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS, VIAJE_ESTADO } from '../constants';

const ViajeCard = ({ viaje, onPress, onUnirse }) => {
  const getEstadoColor = () => {
    switch (viaje.estado) {
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
    switch (viaje.estado) {
      case VIAJE_ESTADO.PENDIENTE:
        return '⏳ Pendiente';
      case VIAJE_ESTADO.ACTIVO:
        return '🟢 En curso';
      case VIAJE_ESTADO.COMPLETADO:
        return '✅ Completado';
      case VIAJE_ESTADO.CANCELADO:
        return '❌ Cancelado';
      default:
        return viaje.estado;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.matricula}>{viaje.matricula}</Text>
          {viaje.modeloVehiculo && (
            <Text style={styles.modelo}>{viaje.modeloVehiculo}</Text>
          )}
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor() }]}>
          <Text style={styles.estadoTexto}>{getEstadoTexto()}</Text>
        </View>
      </View>

      {/* Conductor */}
      <View style={styles.conductorSection}>
        <Text style={styles.label}>Conductor</Text>
        <View style={styles.conductorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {viaje.conductor?.nombre?.charAt(0) || '?'}
            </Text>
          </View>
          <Text style={styles.conductorNombre}>
            {viaje.conductor?.nombre || 'Desconocido'}
          </Text>
        </View>
      </View>

      {/* Ruta */}
      <View style={styles.rutaSection}>
        <View style={styles.punto}>
          <View style={[styles.puntoMarker, { backgroundColor: COLORS.success }]} />
          <View style={styles.puntoInfo}>
            <Text style={styles.puntoLabel}>Inicio</Text>
            <Text style={styles.puntoTexto} numberOfLines={1}>
              {viaje.puntoInicialNombre || viaje.puntoInicialDireccion || 'Ubicación inicial'}
            </Text>
          </View>
        </View>
        <View style={styles.rutaLinea} />
        <View style={styles.punto}>
          <View style={[styles.puntoMarker, { backgroundColor: COLORS.error }]} />
          <View style={styles.puntoInfo}>
            <Text style={styles.puntoLabel}>Destino</Text>
            <Text style={styles.puntoTexto} numberOfLines={1}>
              {viaje.puntoFinalNombre || viaje.puntoFinalDireccion || 'Ubicación final'}
            </Text>
          </View>
        </View>
      </View>

      {/* Pasajeros */}
      {viaje.pasajeros && viaje.pasajeros.length > 0 && (
        <View style={styles.pasajerosSection}>
          <Text style={styles.label}>Pasajeros ({viaje.pasajeros.length})</Text>
          <View style={styles.pasajerosLista}>
            {viaje.pasajeros.slice(0, 3).map((p, index) => (
              <View key={index} style={styles.pasajeroAvatar}>
                <Text style={styles.pasajeroTexto}>
                  {p.usuario?.nombre?.charAt(0) || '?'}
                </Text>
              </View>
            ))}
            {viaje.pasajeros.length > 3 && (
              <View style={styles.masPasajeros}>
                <Text style={styles.masPasajerosTexto}>
                  +{viaje.pasajeros.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.fecha}>{formatDate(viaje.createdAt)}</Text>
        {viaje.distanciaKm && (
          <Text style={styles.distancia}>{viaje.distanciaKm.toFixed(1)} km</Text>
        )}
      </View>

      {/* Botón de unirse (solo para viajes pendientes) */}
      {viaje.estado === VIAJE_ESTADO.PENDIENTE && onUnirse && (
        <TouchableOpacity style={styles.unirseButton} onPress={onUnirse}>
          <Text style={styles.unirseButtonText}>Unirse 🚗</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  matricula: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.gray700,
  },
  modelo: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  estadoBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  estadoTexto: {
    fontSize: FONTS.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  conductorSection: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  conductorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.white,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
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
  pasajerosSection: {
    marginBottom: SPACING.md,
  },
  pasajerosLista: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pasajeroAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  pasajeroTexto: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONTS.xs,
  },
  masPasajeros: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masPasajerosTexto: {
    color: COLORS.gray600,
    fontWeight: 'bold',
    fontSize: FONTS.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontWeight: '600',
  },
  unirseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  unirseButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONTS.md,
  },
});

export default ViajeCard;