// YouConnext - SearchBottomSheet Component
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Search, MapPin, Calendar, Navigation } from "lucide-react-native";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../../constants";
import LocationSelectSheet from "./LocationSelectSheet";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;

const SearchBottomSheet = ({ visible, onClose, onSearch }) => {
  const [slideAnim] = useState(new Animated.Value(SHEET_HEIGHT));
  const [originText, setOriginText] = useState("");
  const [originPlace, setOriginPlace] = useState(null);
  const [destText, setDestText] = useState("");
  const [destPlace, setDestPlace] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeSelectType, setActiveSelectType] = useState(null); // 'origin' o 'destination'
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleSearch = () => {
    const params = {
      origin: originPlace?.address || originText,
      destination: destPlace?.address || destText,
      date: selectedDate || new Date().toISOString().split("T")[0],
      passengers: 1,
    };
    onSearch(params);
    handleClose();
  };

  const showDatePicker = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const options = [
      { label: "Hoy", value: today.toISOString().split("T")[0] },
      { label: "Mañana", value: tomorrow.toISOString().split("T")[0] },
      {
        label: dayAfter.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "short",
        }),
        value: dayAfter.toISOString().split("T")[0],
      },
    ];

    // Simple cycle through options
    const currentIndex = options.findIndex((o) => o.value === selectedDate);
    const nextIndex = (currentIndex + 1) % options.length;
    setSelectedDate(options[nextIndex].value);
  };

  const dateLabel = () => {
    if (!selectedDate) return "Hoy";
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (selectedDate === today) return "Hoy";
    if (selectedDate === tomorrowStr) return "Mañana";
    const d = new Date(selectedDate);
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  const canSearch = (originPlace || originText) && (destPlace || destText);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleClose}
          activeOpacity={1}
        />
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Buscar trayecto</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={COLORS.gray600} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.formContainer}
          >
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Origen */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Navigation
                    size={18}
                    color={COLORS.success}
                    strokeWidth={2.5}
                  />
                </View>
                <TouchableOpacity
                  style={styles.fakeInput}
                  onPress={() => setActiveSelectType("origin")}
                >
                  <Text
                    style={[
                      styles.fakeInputText,
                      originText && styles.fakeInputTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {originText || "Selecciona tu origen"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Destino */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <MapPin size={18} color={COLORS.error} strokeWidth={2.5} />
                </View>
                <TouchableOpacity
                  style={styles.fakeInput}
                  onPress={() => setActiveSelectType("destination")}
                >
                  <Text
                    style={[
                      styles.fakeInputText,
                      destText && styles.fakeInputTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {destText || "Selecciona tu destino"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Fecha */}
              <TouchableOpacity
                style={styles.dateButton}
                onPress={showDatePicker}
              >
                <View style={styles.inputIcon}>
                  <Calendar
                    size={18}
                    color={COLORS.primary}
                    strokeWidth={2.5}
                  />
                </View>
                <Text style={styles.dateText}>{dateLabel()}</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Botón buscar */}
            <TouchableOpacity
              style={[
                styles.searchButton,
                !canSearch && styles.searchButtonDisabled,
              ]}
              onPress={handleSearch}
              disabled={!canSearch}
            >
              <Search size={20} color={COLORS.white} strokeWidth={2.5} />
              <Text style={styles.searchButtonText}>Buscar</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>

      {/* Selector de ubicación (slide secundario) */}
      <LocationSelectSheet
        visible={activeSelectType !== null}
        onClose={() => setActiveSelectType(null)}
        title={
          activeSelectType === "origin"
            ? "Selecciona tu origen"
            : "Selecciona tu destino"
        }
        onSelect={(location) => {
          if (activeSelectType === "origin") {
            setOriginPlace(location);
            console.log(location);
            setOriginText(location.address);
          } else {
            setDestPlace(location);
            setDestText(location.address);
          }
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    ...SHADOWS.large,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
    alignSelf: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray800,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  fakeInput: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    justifyContent: "center",
  },
  fakeInputText: {
    fontSize: FONTS.md,
    color: COLORS.gray400,
  },
  fakeInputTextActive: {
    color: COLORS.gray800,
    fontWeight: "500",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  dateText: {
    fontSize: FONTS.md,
    color: COLORS.gray700,
    marginLeft: SPACING.sm,
    textTransform: "capitalize",
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  searchButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONTS.md,
  },
});

export default SearchBottomSheet;
