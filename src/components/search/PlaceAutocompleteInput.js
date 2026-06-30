import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Keyboard,
} from "react-native";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../../constants";
import {
  autocompletePlaces,
  getPlaceDetails,
} from "../../services/googlePlaces";

const PlaceAutocompleteInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  onSelectPlace,
  biasLocation,
  radius = 50000,
  components,
  disabled = false,
}) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [dropUp, setDropUp] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const requestIdRef = useRef(0);
  const inputRef = useRef(null);

  const SCREEN_HEIGHT = Dimensions.get("window").height;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const trimmed = useMemo(() => (value || "").trim(), [value]);

  useEffect(() => {
    if (!open) return;

    if (!trimmed || trimmed.length < 2) {
      setPredictions([]);
      return;
    }

    const requestId = ++requestIdRef.current;
    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        setErrorText("");
        const items = await autocompletePlaces({
          input: trimmed,
          location: biasLocation,
          radius,
          components,
        });
        if (requestIdRef.current !== requestId) return;
        setPredictions(items);
      } catch (e) {
        if (requestIdRef.current !== requestId) return;
        setPredictions([]);
        setErrorText(
          e?.message || "No se pudo obtener sugerencias. Revisa tu API key.",
        );
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [trimmed, open, biasLocation, radius, components]);

  const measureAndOpen = () => {
    inputRef.current?.measureInWindow((x, y, width, height) => {
      const spaceBelow = SCREEN_HEIGHT - keyboardHeight - (y + height);
      setDropUp(spaceBelow < 250);
    });
    setOpen(true);
  };

  const handlePick = async (prediction) => {
    try {
      setLoading(true);
      setErrorText("");
      const details = await getPlaceDetails({ placeId: prediction.place_id });
      onSelectPlace?.({
        placeId: prediction.place_id,
        name: details.name || prediction.structured_formatting?.main_text,
        address: details.address || prediction.description,
        latitude: details.latitude,
        longitude: details.longitude,
      });
      setOpen(false);
      setPredictions([]);
    } catch (e) {
      setErrorText(
        e?.message || "No se pudo cargar la dirección seleccionada.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(t) => {
            onChangeText?.(t);
            measureAndOpen();
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          style={[styles.input, disabled && styles.inputDisabled]}
          editable={!disabled}
          onFocus={measureAndOpen}
          onBlur={() => {
            setTimeout(() => setOpen(false), 150);
          }}
        />
        {loading && (
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </View>

      {open && predictions.length > 0 && (
        <View
          style={[
            styles.dropdown,
            dropUp ? styles.dropdownUp : styles.dropdownDown,
          ]}
        >
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handlePick(item)}
              >
                <Text style={styles.itemMain}>
                  {item.structured_formatting?.main_text || item.description}
                </Text>
                {!!item.structured_formatting?.secondary_text && (
                  <Text style={styles.itemSecondary}>
                    {item.structured_formatting.secondary_text}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },
  inputRow: {
    position: "relative",
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingRight: SPACING.xl,
    fontSize: FONTS.md,
    color: COLORS.gray700,
    ...SHADOWS.small,
    shadowOpacity: 0,
    elevation: 0,
  },
  inputDisabled: {
    backgroundColor: COLORS.gray100,
    color: COLORS.gray500,
  },
  loadingIcon: {
    position: "absolute",
    right: SPACING.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  dropdown: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    maxHeight: 220,
    overflow: "hidden",
    zIndex: 1000,
    elevation: 1000,
    ...SHADOWS.medium,
  },
  dropdownDown: {
    top: "100%",
    marginTop: SPACING.xs,
  },
  dropdownUp: {
    bottom: "100%",
    marginBottom: SPACING.xs,
  },
  item: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  itemMain: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.gray700,
  },
  itemSecondary: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  errorText: {
    marginTop: SPACING.xs,
    color: COLORS.danger,
    fontSize: FONTS.xs,
  },
});

export default PlaceAutocompleteInput;
