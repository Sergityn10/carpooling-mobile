// YouConnext - App Navigator
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet } from "react-native";
import { COLORS, FONTS } from "../constants";
import {
  HomeScreen,
  PerfilScreen,
  EscanearQRScreen,
  ViajeDetalleScreen,
} from "../screens";
import ViajeEnCursoScreen from "../screens/ViajeEnCursoScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Componente para los iconos del tab
const TabIcon = ({ icon, label, focused }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {icon}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </View>
);

// Navegación principal (con tabs)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Inicio" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="EscanearQR"
        component={EscanearQRScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📱" label="Escanear" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Navegación principal de la app
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="EscanearQR"
          component={EscanearQRScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="ViajeDetalle" component={ViajeDetalleScreen} />
        <Stack.Screen name="ViajeEnCurso" component={ViajeEnCursoScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Historial" component={HomeScreen} />
        <Stack.Screen name="Estadisticas" component={HomeScreen} />
        <Stack.Screen name="Ajustes" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
  },
  tabLabelFocused: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});

export default AppNavigator;
