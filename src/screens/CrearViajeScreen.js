// YouConnext - Crear Viaje Screen (Wizard multi-paso)
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Car,
  Euro,
  Navigation as NavIcon,
} from "lucide-react-native";
import { useUser } from "../context/UserContext";
import { useViaje } from "../context/ViajeContext";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../constants";
import { Button, PlaceAutocompleteInput, TripMapPreview } from "../components";
import { getDirectionsRoute } from "../services/googlePlaces";

const STEPS = {
  FECHA_HORA: 0,
  MAPA: 1,
  PRECIO: 2,
};

// ==================== Scroll Picker Component ====================
const ScrollPicker = ({
  items,
  selectedValue,
  onValueChange,
  itemHeight = 44,
}) => {
  const flatListRef = useRef(null);
  const isScrolling = useRef(false);

  const getItemLayout = (_, index) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });

  const handleScroll = (e) => {
    if (isScrolling.current) return;
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (
      index >= 0 &&
      index < items.length &&
      items[index].value !== selectedValue
    ) {
      onValueChange(items[index].value);
    }
  };

  const onMomentumScrollEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (index >= 0 && index < items.length) {
      onValueChange(items[index].value);
    }
    isScrolling.current = false;
  };

  const onScrollBeginDrag = () => {
    isScrolling.current = true;
  };

  return (
    <View style={pickerStyles.container}>
      <View style={pickerStyles.highlightRow} pointerEvents="none" />
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => String(item.value)}
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        initialScrollIndex={Math.max(
          0,
          items.findIndex((i) => i.value === selectedValue),
        )}
        renderItem={({ item }) => {
          const isSelected = item.value === selectedValue;
          return (
            <View style={{ height: itemHeight, justifyContent: "center" }}>
              <Text
                style={[
                  pickerStyles.itemText,
                  isSelected && pickerStyles.itemTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

const pickerStyles = StyleSheet.create({
  container: {
    height: 220,
    position: "relative",
  },
  highlightRow: {
    position: "absolute",
    top: 88,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.sm,
  },
  itemText: {
    textAlign: "center",
    fontSize: FONTS.md,
    color: COLORS.gray400,
  },
  itemTextSelected: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray800,
  },
});

// ==================== Date/Time Picker Modal ====================
const DateTimePickerModal = ({
  visible,
  mode,
  currentDate,
  currentTime,
  onConfirm,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [selectedHour, setSelectedHour] = useState(
    new Date(currentTime).getHours(),
  );
  const [selectedMinute, setSelectedMinute] = useState(
    new Date(currentTime).getMinutes(),
  );

  useEffect(() => {
    if (visible) {
      setSelectedDate(currentDate);
      setSelectedHour(new Date(currentTime).getHours());
      setSelectedMinute(new Date(currentTime).getMinutes());
    }
  }, [visible]);

  const dayItems = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const label = d.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return { value: d.getTime(), label };
  });

  const hourItems = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, "0"),
  }));

  const minuteItems = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, "0"),
  }));

  const handleConfirm = () => {
    const finalTime = new Date();
    finalTime.setHours(selectedHour, selectedMinute, 0, 0);
    onConfirm(selectedDate, finalTime);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={dtStyles.overlay}>
        <View style={dtStyles.container}>
          <View style={dtStyles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={dtStyles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={dtStyles.title}>
              {mode === "date" ? "Selecciona fecha" : "Selecciona hora"}
            </Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={dtStyles.doneText}>Hecho</Text>
            </TouchableOpacity>
          </View>

          {mode === "date" ? (
            <ScrollPicker
              items={dayItems}
              selectedValue={selectedDate}
              onValueChange={setSelectedDate}
            />
          ) : (
            <View style={dtStyles.timeRow}>
              <View style={dtStyles.timeColumn}>
                <Text style={dtStyles.timeLabel}>Hora</Text>
                <ScrollPicker
                  items={hourItems}
                  selectedValue={selectedHour}
                  onValueChange={setSelectedHour}
                />
              </View>
              <Text style={dtStyles.timeSeparator}>:</Text>
              <View style={dtStyles.timeColumn}>
                <Text style={dtStyles.timeLabel}>Min</Text>
                <ScrollPicker
                  items={minuteItems}
                  selectedValue={selectedMinute}
                  onValueChange={setSelectedMinute}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const dtStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  title: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.gray800,
  },
  cancelText: {
    fontSize: FONTS.md,
    color: COLORS.gray500,
    fontWeight: "600",
  },
  doneText: {
    fontSize: FONTS.md,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  timeColumn: {
    flex: 1,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  timeSeparator: {
    fontSize: FONTS.xxl,
    fontWeight: "bold",
    color: COLORS.gray800,
    paddingBottom: SPACING.xl,
  },
});

// ==================== Main Screen ====================
const CrearViajeScreen = ({ navigation }) => {
  const { user } = useUser();
  const { crearViajeRapido } = useViaje();

  const [step, setStep] = useState(STEPS.FECHA_HORA);

  // Step 1: Fecha y hora
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Step 2: Origen y destino
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [origenTexto, setOrigenTexto] = useState("");
  const [origenPlace, setOrigenPlace] = useState(null);
  const [destinoTexto, setDestinoTexto] = useState("");
  const [destinoPlace, setDestinoPlace] = useState(null);
  const [rutaInfo, setRutaInfo] = useState(null);
  const [calculandoRuta, setCalculandoRuta] = useState(false);

  // Step 3: Precio
  const [precio, setPrecio] = useState("");
  const [plazas, setPlazas] = useState("4");
  const [creando, setCreando] = useState(false);

  // Cargar ubicación actual al montar
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const coords = location.coords;
        setUbicacionActual(coords);

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
        } catch {}

        setOrigenPlace({
          latitude: coords.latitude,
          longitude: coords.longitude,
          name: nombre,
          address: direccion,
        });
        setOrigenTexto(direccion || nombre);
      } catch (error) {
        console.log("Error al obtener ubicación:", error);
      }
    })();
  }, []);

  // Calcular ruta cuando se tienen origen y destino
  useEffect(() => {
    if (!origenPlace?.latitude || !destinoPlace?.latitude) {
      setRutaInfo(null);
      return;
    }

    const calcularRuta = async () => {
      setCalculandoRuta(true);
      try {
        const result = await getDirectionsRoute({
          origin: origenPlace,
          destination: destinoPlace,
        });
        setRutaInfo(result);
      } catch (error) {
        console.log("Error al calcular ruta:", error);
        setRutaInfo(null);
      } finally {
        setCalculandoRuta(false);
      }
    };

    calcularRuta();
  }, [origenPlace, destinoPlace]);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (time) => {
    const d = new Date(time);
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateForApi = (date, time) => {
    const d = new Date(date);
    const t = new Date(time);
    const fechaStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const horaStr = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
    return { fecha: fechaStr, hora: horaStr };
  };

  const canNextStep = () => {
    if (step === STEPS.FECHA_HORA) return true;
    if (step === STEPS.MAPA)
      return origenPlace?.latitude && destinoPlace?.latitude;
    if (step === STEPS.PRECIO) return precio !== "" && parseFloat(precio) >= 0;
    return false;
  };

  const handleNext = () => {
    if (step === STEPS.PRECIO) {
      handleCrearViaje();
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === STEPS.FECHA_HORA) {
      navigation.goBack();
      return;
    }
    setStep(step - 1);
  };

  const handleCrearViaje = async () => {
    if (!user) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para crear un viaje.");
      return;
    }

    if (!origenPlace?.latitude || !destinoPlace?.latitude) {
      Alert.alert("Faltan datos", "Selecciona origen y destino.");
      return;
    }

    const { fecha: fechaApi, hora: horaApi } = formatDateForApi(fecha, hora);
    const precioNum = parseFloat(precio) || 0;
    const plazasNum = parseInt(plazas) || 4;

    setCreando(true);
    try {
      const response = await crearViajeRapido({
        conductorId: user.id,
        origen: origenPlace.address || origenPlace.name || origenTexto,
        destino: destinoPlace.address || destinoPlace.name || destinoTexto,
        fecha: fechaApi,
        hora: horaApi,
        plazas: plazasNum,
        precio: precioNum,
      });

      Alert.alert("Viaje creado", "Tu viaje se ha creado correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error?.message || "No se pudo crear el viaje. Intenta de nuevo.",
      );
    } finally {
      setCreando(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[STEPS.FECHA_HORA, STEPS.MAPA, STEPS.PRECIO].map((s) => (
        <View
          key={s}
          style={[styles.stepDot, step >= s && styles.stepDotActive]}
        />
      ))}
    </View>
  );

  const renderFechaHoraStep = () => (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.stepContent}
    >
      <View style={styles.stepHeader}>
        <Calendar size={32} color={COLORS.primary} strokeWidth={2} />
        <Text style={styles.stepTitle}>¿Cuándo salimos?</Text>
        <Text style={styles.stepSubtitle}>
          Selecciona la fecha y hora de salida
        </Text>
      </View>

      <TouchableOpacity
        style={styles.dateCard}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dateCardIcon}>
          <Calendar size={24} color={COLORS.primary} strokeWidth={2} />
        </View>
        <View style={styles.dateCardContent}>
          <Text style={styles.dateCardLabel}>Fecha</Text>
          <Text style={styles.dateCardValue}>{formatDate(fecha)}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.gray400} strokeWidth={2} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dateCard}
        onPress={() => setShowTimePicker(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dateCardIcon}>
          <Clock size={24} color={COLORS.primary} strokeWidth={2} />
        </View>
        <View style={styles.dateCardContent}>
          <Text style={styles.dateCardLabel}>Hora de salida</Text>
          <Text style={styles.dateCardValue}>{formatTime(hora)}</Text>
        </View>
        <ChevronRight size={20} color={COLORS.gray400} strokeWidth={2} />
      </TouchableOpacity>

      <DateTimePickerModal
        visible={showDatePicker}
        mode="date"
        currentDate={fecha}
        currentTime={hora}
        onConfirm={(newDate) => {
          setFecha(new Date(newDate));
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      <DateTimePickerModal
        visible={showTimePicker}
        mode="time"
        currentDate={fecha}
        currentTime={hora}
        onConfirm={(_, newTime) => {
          setHora(new Date(newTime));
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />
    </ScrollView>
  );

  const renderMapaStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <MapPin size={32} color={COLORS.primary} strokeWidth={2} />
        <Text style={styles.stepTitle}>Origen y destino</Text>
        <Text style={styles.stepSubtitle}>
          Selecciona desde dónde y hacia dónde vas
        </Text>
      </View>

      <View style={styles.mapPreviewContainer}>
        <TripMapPreview
          origin={origenPlace}
          destination={destinoPlace}
          height={200}
        />
      </View>

      {rutaInfo && (
        <View style={styles.rutaInfoCard}>
          <View style={styles.rutaInfoItem}>
            <NavIcon size={16} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.rutaInfoText}>
              {(rutaInfo.distanceMeters / 1000).toFixed(1)} km
            </Text>
          </View>
          <View style={styles.rutaInfoItem}>
            <Clock size={16} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.rutaInfoText}>
              {Math.ceil(rutaInfo.durationSeconds / 60)} min
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
      </ScrollView>
    </View>
  );

  const renderPrecioStep = () => (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.stepContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.stepHeader}>
        <Euro size={32} color={COLORS.primary} strokeWidth={2} />
        <Text style={styles.stepTitle}>Precio por pasajero</Text>
        <Text style={styles.stepSubtitle}>
          Define cuánto paga cada pasajero y cuántas plazas ofreces
        </Text>
      </View>

      {rutaInfo && (
        <View style={styles.rutaResumenCard}>
          <View style={styles.rutaResumenRow}>
            <Text style={styles.rutaResumenLabel}>Distancia</Text>
            <Text style={styles.rutaResumenValue}>
              {(rutaInfo.distanceMeters / 1000).toFixed(1)} km
            </Text>
          </View>
          <View style={styles.rutaResumenRow}>
            <Text style={styles.rutaResumenLabel}>Duración</Text>
            <Text style={styles.rutaResumenValue}>
              {Math.ceil(rutaInfo.durationSeconds / 60)} min
            </Text>
          </View>
        </View>
      )}

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Precio por pasajero (€)</Text>
        <View style={styles.priceInputRow}>
          <Euro size={20} color={COLORS.gray400} strokeWidth={2} />
          <TextInput
            style={styles.priceInput}
            value={precio}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9.]/g, "");
              setPrecio(cleaned);
            }}
            placeholder="0.00"
            placeholderTextColor={COLORS.gray400}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Plazas disponibles</Text>
        <View style={styles.plazasRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.plazaButton,
                parseInt(plazas) === n && styles.plazaButtonActive,
              ]}
              onPress={() => setPlazas(String(n))}
            >
              <Text
                style={[
                  styles.plazaButtonText,
                  parseInt(plazas) === n && styles.plazaButtonTextActive,
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.resumenCard}>
        <View style={styles.resumenRow}>
          <Calendar size={18} color={COLORS.gray500} strokeWidth={2} />
          <Text style={styles.resumenText}>{formatDate(fecha)}</Text>
        </View>
        <View style={styles.resumenRow}>
          <Clock size={18} color={COLORS.gray500} strokeWidth={2} />
          <Text style={styles.resumenText}>{formatTime(hora)}</Text>
        </View>
        <View style={styles.resumenRow}>
          <MapPin size={18} color={COLORS.gray500} strokeWidth={2} />
          <Text style={styles.resumenText} numberOfLines={1}>
            {origenTexto || "Origen"} → {destinoTexto || "Destino"}
          </Text>
        </View>
        <View style={styles.resumenRow}>
          <Car size={18} color={COLORS.gray500} strokeWidth={2} />
          <Text style={styles.resumenText}>
            {plazas} plaza{parseInt(plazas) !== 1 ? "s" : ""} ·{" "}
            {precio ? `${precio}€` : "—"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color={COLORS.gray700} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear viaje</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {renderStepIndicator()}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {step === STEPS.FECHA_HORA && renderFechaHoraStep()}
        {step === STEPS.MAPA && renderMapaStep()}
        {step === STEPS.PRECIO && renderPrecioStep()}
      </KeyboardAvoidingView>

      {/* Footer con botón */}
      <View style={styles.footer}>
        <Button
          title={step === STEPS.PRECIO ? "Crear viaje" : "Siguiente"}
          onPress={handleNext}
          variant="primary"
          size="large"
          disabled={!canNextStep() || creando}
          loading={creando}
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray800,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray200,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  stepContent: {
    paddingBottom: SPACING.xl,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  stepTitle: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.gray800,
    marginTop: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  dateCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  dateCardContent: {
    flex: 1,
  },
  dateCardLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    fontWeight: "500",
  },
  dateCardValue: {
    fontSize: FONTS.md,
    color: COLORS.gray800,
    fontWeight: "600",
    marginTop: 2,
    textTransform: "capitalize",
  },
  mapPreviewContainer: {
    marginBottom: SPACING.md,
  },
  rutaInfoCard: {
    flexDirection: "row",
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.lg,
  },
  rutaInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  rutaInfoText: {
    fontSize: FONTS.sm,
    color: COLORS.primaryDark,
    fontWeight: "600",
  },
  rutaResumenCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  rutaResumenRow: {
    flex: 1,
    alignItems: "center",
  },
  rutaResumenLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  rutaResumenValue: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray800,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  inputLabel: {
    fontSize: FONTS.sm,
    color: COLORS.gray600,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  priceInput: {
    flex: 1,
    fontSize: FONTS.xxl,
    fontWeight: "bold",
    color: COLORS.gray800,
    padding: 0,
  },
  plazasRow: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  plazaButton: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  plazaButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  plazaButtonText: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.gray500,
  },
  plazaButtonTextActive: {
    color: COLORS.primary,
  },
  resumenCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  resumenRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  resumenText: {
    fontSize: FONTS.sm,
    color: COLORS.gray700,
    flex: 1,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  footerButton: {
    width: "100%",
  },
});

export default CrearViajeScreen;
