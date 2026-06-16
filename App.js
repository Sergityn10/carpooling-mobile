// YouConnext - Main App Entry Point
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from './src/context/UserContext';
import { ViajeProvider } from './src/context/ViajeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={COLORS.white} />
      <UserProvider>
        <ViajeProvider>
          <AppNavigator />
        </ViajeProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}