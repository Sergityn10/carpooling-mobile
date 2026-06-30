import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../../constants";
import {
  buildStaticMapUrl,
  getDirectionsRoute,
} from "../../services/googlePlaces";

const TripMapPreview = ({ origin, destination, height = 160 }) => {
  const [imageError, setImageError] = useState(false);
  const [encodedPolyline, setEncodedPolyline] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const requestIdRef = useRef(0);

  const hasAnyPoint =
    (origin?.latitude != null && origin?.longitude != null) ||
    (destination?.latitude != null && destination?.longitude != null);

  const hasBothPoints =
    origin?.latitude != null &&
    origin?.longitude != null &&
    destination?.latitude != null &&
    destination?.longitude != null;

  useEffect(() => {
    setImageError(false);
  }, [origin, destination]);

  useEffect(() => {
    if (!hasBothPoints) {
      setEncodedPolyline(null);
      setRouteError("");
      return;
    }

    const requestId = ++requestIdRef.current;
    const run = async () => {
      try {
        setLoadingRoute(true);
        setRouteError("");
        const result = await getDirectionsRoute({ origin, destination });
        if (requestIdRef.current !== requestId) return;
        setEncodedPolyline(result.encodedPolyline);
      } catch (e) {
        if (requestIdRef.current !== requestId) return;
        setEncodedPolyline(null);
        setRouteError(e?.message || "No se pudo obtener la ruta");
      } finally {
        if (requestIdRef.current === requestId) setLoadingRoute(false);
      }
    };

    run();
  }, [hasBothPoints, origin, destination]);

  const url = useMemo(() => {
    try {
      if (!hasAnyPoint) return null;
      return buildStaticMapUrl({
        origin,
        destination,
        encodedPolyline,
        width: 640,
        height: 320,
        scale: 2,
      });
    } catch {
      return null;
    }
  }, [origin, destination, encodedPolyline, hasAnyPoint]);

  if (!url || imageError) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>
          {!hasAnyPoint
            ? "Selecciona origen y/o destino para ver el mapa"
            : routeError
              ? routeError
              : "No se pudo cargar el mapa (revisa API key / billing / Maps Static API / Directions API)"}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <Image
        source={{ uri: url }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
      {loadingRoute && (
        <View style={styles.routeLoadingPill}>
          <Text style={styles.routeLoadingText}>Calculando ruta…</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.gray100,
  },
  placeholder: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  placeholderText: {
    color: COLORS.gray600,
    fontSize: FONTS.sm,
    textAlign: "center",
  },
  routeLoadingPill: {
    position: "absolute",
    bottom: SPACING.sm,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
  },
  routeLoadingText: {
    color: COLORS.white,
    fontSize: FONTS.xs,
    fontWeight: "600",
  },
});

export default TripMapPreview;
