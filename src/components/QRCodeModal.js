// YouConnext - QRCodeModal Component
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../constants';

const QRCodeModal = ({ visible, onClose, viaje, codigoQR }) => {
  if (!viaje) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.titulo}>¡Viaje creado! 🎉</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* QR Code */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={`youconnext://unirse/${viaje.id}`}
                size={200}
                color={COLORS.gray700}
                backgroundColor={COLORS.white}
              />
            </View>
            <Text style={styles.instruction}>
              Escanea este código para unirte al viaje
            </Text>
          </View>

          {/* Código textual */}
          <View style={styles.codigoSection}>
            <Text style={styles.codigoLabel}>O comparte este código:</Text>
            <View style={styles.codigoBox}>
              <Text style={styles.codigoTexto}>{viaje.codigoQR}</Text>
            </View>
          </View>

          {/* Info del viaje */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Matrícula</Text>
              <Text style={styles.infoValue}>{viaje.matricula}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Conductor</Text>
              <Text style={styles.infoValue}>
                {viaje.conductor?.nombre || 'Desconocido'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pasajeros</Text>
              <Text style={styles.infoValue}>
                {viaje.pasajeros?.length || 0}
              </Text>
            </View>
          </View>

          {/* Botón cerrar */}
          <TouchableOpacity style={styles.cerrarButton} onPress={onClose}>
            <Text style={styles.cerrarButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 340,
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  titulo: {
    fontSize: FONTS.xl,
    fontWeight: 'bold',
    color: COLORS.gray700,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: FONTS.lg,
    color: COLORS.gray500,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  qrWrapper: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  instruction: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  codigoSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  codigoLabel: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.sm,
  },
  codigoBox: {
    backgroundColor: COLORS.gray100,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  codigoTexto: {
    fontSize: FONTS.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  infoSection: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  infoValue: {
    fontSize: FONTS.sm,
    color: COLORS.gray700,
    fontWeight: '600',
  },
  cerrarButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cerrarButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONTS.md,
  },
});

export default QRCodeModal;