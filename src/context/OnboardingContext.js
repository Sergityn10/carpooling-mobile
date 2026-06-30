// YouConnext - Onboarding Context
import React, { createContext, useContext, useState } from "react";
import { useUser } from "./UserContext";

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const { user, actualizarUsuario } = useUser();
  const [step, setStep] = useState(0);
  const [fechaNacimiento, setFechaNacimiento] = useState(null);
  const [telefono, setTelefono] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalSteps = 2;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const completeOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await actualizarUsuario({
        fecha_nacimiento: fechaNacimiento,
        phone: telefono,
        onboarding_ended: true,
      });
      return updatedUser;
    } catch (err) {
      setError(err.message || "Error al completar el onboarding");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const needsOnboarding = () => {
    if (!user) return false;
    const ended = user.onboarding_ended;
    return ended === 0 || ended === false || ended === "0" || ended === null;
  };

  const value = {
    step,
    totalSteps,
    fechaNacimiento,
    telefono,
    loading,
    error,
    setFechaNacimiento,
    setTelefono,
    nextStep,
    prevStep,
    completeOnboarding,
    needsOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding debe ser usado dentro de OnboardingProvider");
  }
  return context;
};

export default OnboardingContext;
