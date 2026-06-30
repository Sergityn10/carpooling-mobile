// YouConnext - SearchTrayectosScreen
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  MapPin,
  SlidersHorizontal,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../constants";
import { Button, ViajeCard, SearchBottomSheet } from "../components";
import { trayectoService } from "../services/travels/trayectoService";

const SearchTrayectosScreen = ({ navigation, route }) => {
  const initialParams = route.params?.searchParams || null;

  const [searchParams, setSearchParams] = useState(initialParams);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const performSearch = async (params) => {
    if (!params) return;
    setLoading(true);
    setError(null);
    try {
      const response = await trayectoService.buscarTrayectos({
        origin: params.origin,
        destination: params.destination,
        date: params.date,
        passengers: params.passengers || 1,
      });
      const data = response.data || response.trayectos || response || [];
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al buscar trayectos");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialParams) {
      setSearchParams(initialParams);
      performSearch(initialParams);
    }
  }, []);

  const handleSearch = (params) => {
    setSearchParams(params);
    performSearch(params);
  };

  const handleViajePress = (viaje) => {
    navigation.navigate("ViajeDetalle", { viaje });
  };

  const renderResult = ({ item }) => (
    <ViajeCard
      viaje={item}
      onPress={() => handleViajePress(item)}
      onUnirse={() => navigation.navigate("EscanearQR")}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Error</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      );
    }
    if (!searchParams) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Search size={40} color={COLORS.gray300} strokeWidth={2} />
          </View>
          <Text style={styles.emptyTitle}>Busca tu trayecto</Text>
          <Text style={styles.emptyText}>
            Toca el campo de búsqueda para establecer tu origen, destino y fecha
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <MapPin size={40} color={COLORS.gray300} strokeWidth={2} />
        </View>
        <Text style={styles.emptyTitle}>Sin resultados</Text>
        <Text style={styles.emptyText}>
          No se encontraron trayectos para esta búsqueda. Prueba con otra fecha
          u origen.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header con input de búsqueda */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={22} color={COLORS.gray700} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchInput}
          onPress={() => setSheetVisible(true)}
          activeOpacity={0.7}
        >
          <Search size={18} color={COLORS.gray400} strokeWidth={2.5} />
          <Text
            style={[
              styles.searchPlaceholder,
              searchParams?.destination && styles.searchValue,
            ]}
            numberOfLines={1}
          >
            {searchParams?.destination || "Establece tu destino"}
          </Text>
          <View style={styles.filterIcon}>
            <SlidersHorizontal
              size={16}
              color={COLORS.primary}
              strokeWidth={2.5}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Info de búsqueda activa */}
      {searchParams && (
        <View style={styles.searchInfoBar}>
          <View style={styles.searchInfoItem}>
            <Text style={styles.searchInfoLabel}>Origen</Text>
            <Text style={styles.searchInfoValue} numberOfLines={1}>
              {searchParams.origin}
            </Text>
          </View>
          <View style={styles.searchInfoDivider} />
          <View style={styles.searchInfoItem}>
            <Text style={styles.searchInfoLabel}>Fecha</Text>
            <Text style={styles.searchInfoValue} numberOfLines={1}>
              {searchParams.date}
            </Text>
          </View>
        </View>
      )}

      {/* Resultados */}
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderResult}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Buscando trayectos...</Text>
            </View>
          ) : null
        }
        contentContainerStyle={
          results.length === 0 ? styles.emptyList : styles.resultsList
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Sheet */}
      <SearchBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
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
    alignItems: "center",
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
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.gray400,
  },
  searchValue: {
    color: COLORS.gray800,
    fontWeight: "500",
  },
  filterIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInfoBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  searchInfoItem: {
    flex: 1,
  },
  searchInfoLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray400,
    textTransform: "uppercase",
  },
  searchInfoValue: {
    fontSize: FONTS.sm,
    color: COLORS.gray700,
    marginTop: 2,
  },
  searchInfoDivider: {
    width: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: SPACING.md,
  },
  resultsList: {
    padding: SPACING.lg,
  },
  emptyList: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    textAlign: "center",
  },
});

export default SearchTrayectosScreen;
