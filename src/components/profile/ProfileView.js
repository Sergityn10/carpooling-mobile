// YouConnext - ProfileView (seccionado)
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Mail,
  Phone,
  Calendar,
  Car,
  Users,
  Pencil,
  LogOut,
  Route,
  Wallet,
  UserCircle,
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  Star,
  Check,
  X,
  User as UserIcon,
  MapPin,
  ArrowRight,
  Clock,
  Euro,
  Heart,
  History,
  Building,
  ChevronLeft,
  Sparkles,
  Male,
  Female,
  MessageSquare,
  Award,
  Info,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  ExternalLink,
  TrendingUp,
  Camera,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from "../../constants";
import { useUser } from "../../context/UserContext";
import { trayectoService } from "../../services/travels/trayectoService";
import { reservaService } from "../../services/travels/reservaService";
import { carService } from "../../services/carService";
import { paymentService } from "../../services/paymentService";
import { POPULAR_CARS, FUEL_TYPES, CAR_COLORS } from "../../constants/carsData";

const ProfileView = ({ user, navigation, onLogout }) => {
  const { actualizarUsuario } = useUser();
  const [currentSubView, setCurrentSubView] = useState("menu"); // "menu", "mi-perfil", "historial", "rutinas", "monedero"
  const [editingSection, setEditingSection] = useState(null); // null | "datos-personales" | "datos-cuenta" | "sobre-mi"
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    surname: user.surname || "",
    email: user.email || "",
    phone: user.phone || "",
    fecha_nacimiento: user.fecha_nacimiento || "",
    genero: user.genero || "",
    about_me: user.about_me || "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(
    user.fecha_nacimiento
      ? new Date(user.fecha_nacimiento)
      : new Date(2000, 0, 1),
  );

  const [viajes, setViajes] = useState([]);
  const [loadingViajes, setLoadingViajes] = useState(false);
  const [errorViajes, setErrorViajes] = useState(null);

  // Estados para gestión de coches
  const [coches, setCoches] = useState([]);
  const [loadingCoches, setLoadingCoches] = useState(false);
  const [errorCoches, setErrorCoches] = useState(null);
  const [showCocheForm, setShowCocheForm] = useState(false);
  const [editingCocheId, setEditingCocheId] = useState(null);
  const [savingCoche, setSavingCoche] = useState(false);
  const [cocheFormData, setCocheFormData] = useState({
    matricula: "",
    marca: "",
    modelo: "",
    color: "Blanco",
    tipo_combustible: "Gasolina",
    num_plazas: "5",
    year: String(new Date().getFullYear()),
  });

  // Estados de autocompletado para coches
  const [showMarcaSuggestions, setShowMarcaSuggestions] = useState(false);
  const [showModeloSuggestions, setShowModeloSuggestions] = useState(false);

  // Estados del monedero / Stripe
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletPayouts, setWalletPayouts] = useState([]);
  const [stripeBalance, setStripeBalance] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [walletError, setWalletError] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [processingPayout, setProcessingPayout] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sincronizar formData cuando el user del contexto se actualiza
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        phone: user.phone || "",
        fecha_nacimiento: user.fecha_nacimiento || "",
        genero: user.genero || "",
        about_me: user.about_me || "",
      });
      if (user.fecha_nacimiento) {
        setDatePickerDate(new Date(user.fecha_nacimiento));
      }
    }
  }, [user]);

  const fetchCoches = useCallback(async () => {
    setLoadingCoches(true);
    setErrorCoches(null);
    try {
      const res = await carService.obtenerCochesUsuario(user.id);
      if (res && res.status === "Success") {
        setCoches(res.cars || []);
      } else {
        setCoches([]);
      }
    } catch (err) {
      console.error("Error al cargar coches de perfil:", err);
      setErrorCoches("No se pudieron cargar tus vehículos.");
    } finally {
      setLoadingCoches(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (currentSubView === "mis-vehiculos") {
      fetchCoches();
    }
  }, [currentSubView, fetchCoches]);

  const fetchWalletData = useCallback(async () => {
    setLoadingWallet(true);
    setWalletError(null);
    try {
      const [balanceRes, txRes, payoutsRes, linkedRes] =
        await Promise.allSettled([
          paymentService.getWalletBalance(),
          paymentService.getWalletTransactions(20, 0),
          paymentService.getWalletPayouts(10, 0),
          paymentService.getLinkedAccounts(),
        ]);
      if (balanceRes.status === "fulfilled" && balanceRes.value?.balances) {
        setWalletBalance(balanceRes.value.balances);
      }
      if (txRes.status === "fulfilled" && txRes.value?.transactions) {
        setWalletTransactions(txRes.value.transactions);
      }
      if (payoutsRes.status === "fulfilled" && payoutsRes.value?.payouts) {
        setWalletPayouts(payoutsRes.value.payouts);
      }
      if (linkedRes.status === "fulfilled" && linkedRes.value?.cuentas) {
        setLinkedAccounts(linkedRes.value.cuentas);
      }
    } catch (err) {
      console.error("Error al cargar datos del monedero:", err);
      setWalletError("No se pudieron cargar los datos del monedero.");
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  useEffect(() => {
    if (currentSubView === "monedero") {
      fetchWalletData();
    }
  }, [currentSubView, fetchWalletData]);

  useEffect(() => {
    paymentService
      .getWalletBalance()
      .then((res) => {
        if (res?.balances) setWalletBalance(res.balances);
      })
      .catch(() => {});
  }, []);

  const fetchViajes = useCallback(async () => {
    setLoadingViajes(true);
    setErrorViajes(null);
    try {
      const [conductorRes, pasajeroRes] = await Promise.allSettled([
        trayectoService.obtenerMisTrayectos(),
        reservaService.obtenerMisReservas(user.id),
      ]);

      let misTrayectos = [];
      if (conductorRes.status === "fulfilled") {
        const raw = conductorRes.value;
        console.log(
          "[fetchViajes] mis-trayectos raw response:",
          JSON.stringify(raw)?.slice(0, 300),
        );
        misTrayectos = Array.isArray(raw) ? raw : [];
      } else {
        console.warn(
          "Error al cargar trayectos como conductor:",
          conductorRes.reason,
        );
      }

      let misReservas = [];
      if (pasajeroRes.status === "fulfilled") {
        misReservas = pasajeroRes.value?.pasajerosList || [];
      } else {
        console.warn(
          "Error al cargar reservas como pasajero:",
          pasajeroRes.reason,
        );
      }

      const condViajes = misTrayectos.map((t) => ({
        id: t.id,
        origen: t.origen,
        destino: t.destino,
        hora: t.hora || t.fecha,
        plazas: t.plazas,
        disponible: t.disponible,
        precio: t.precio,
        conductorName: `${user.name} ${user.surname}`,
        conductor_id: user.id,
        status: t.status || t.estado || "pendiente",
        rol: "conductor",
        keyId: `cond-${t.id}`,
        originalData: t,
      }));

      const pasViajes = misReservas.map((r) => {
        const t = r.trayecto || {};
        return {
          id: t.id,
          id_reserva: r.id_reserva,
          origen: t.origen || "Sin especificar",
          destino: t.destino || "Sin especificar",
          hora: t.hora || t.fecha || r.createdAt,
          plazas: t.plazas,
          precio: t.precio,
          conductorName: t.conductor || "Conductor",
          conductor_id: t.conductor_id,
          status: t.status || t.estado || "pendiente",
          reservaStatus: r.status,
          rol: "pasajero",
          keyId: `pas-${r.id_reserva}`,
          originalData: t,
        };
      });

      const todos = [...condViajes, ...pasViajes];

      // Ordenar por fecha-hora descendente
      todos.sort((a, b) => {
        const dateA = new Date(a.hora);
        const dateB = new Date(b.hora);
        return dateB - dateA;
      });

      setViajes(todos);
    } catch (err) {
      console.error("Error al cargar viajes de perfil:", err);
      setErrorViajes("No se pudieron cargar tus viajes.");
    } finally {
      setLoadingViajes(false);
    }
  }, [user.id, user.name, user.surname]);

  useEffect(() => {
    fetchViajes();
  }, [fetchViajes]);

  useEffect(() => {
    if (currentSubView === "historial") {
      fetchViajes();
    }
  }, [currentSubView, fetchViajes]);

  const agruparViajesPorFecha = (listaViajes) => {
    const grupos = {};
    listaViajes.forEach((viaje) => {
      if (!viaje.hora) return;
      const fechaObj = new Date(viaje.hora);

      if (isNaN(fechaObj.getTime())) {
        const desc = "Fecha por confirmar";
        if (!grupos[desc]) grupos[desc] = [];
        grupos[desc].push(viaje);
        return;
      }

      const hoy = new Date();
      const mañana = new Date();
      mañana.setDate(hoy.getDate() + 1);

      let fechaLegible = "";
      if (fechaObj.toDateString() === hoy.toDateString()) {
        fechaLegible = "Hoy";
      } else if (fechaObj.toDateString() === mañana.toDateString()) {
        fechaLegible = "Mañana";
      } else {
        fechaLegible = fechaObj.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        fechaLegible =
          fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1);
      }

      if (!grupos[fechaLegible]) {
        grupos[fechaLegible] = [];
      }
      grupos[fechaLegible].push(viaje);
    });
    return grupos;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, fecha_nacimiento: formattedDate }));
      setDatePickerDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleSaveSection = async (section) => {
    setSaving(true);
    try {
      let datosToUpdate = {};
      if (section === "datos-personales") {
        if (!formData.name.trim()) {
          Alert.alert("Error", "El nombre es obligatorio.");
          setSaving(false);
          return;
        }
        datosToUpdate = {
          name: formData.name.trim(),
          surname: formData.surname.trim(),
          fecha_nacimiento: formData.fecha_nacimiento,
          genero: formData.genero,
        };
      } else if (section === "datos-cuenta") {
        datosToUpdate = {
          phone: formData.phone.trim(),
        };
      } else if (section === "sobre-mi") {
        datosToUpdate = {
          about_me: formData.about_me,
        };
      }

      await actualizarUsuario(datosToUpdate);
      Alert.alert(
        "Sección actualizada",
        "Tus datos se han guardado correctamente.",
      );
      setEditingSection(null);
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSection = (section) => {
    if (section === "datos-personales") {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        surname: user.surname || "",
        fecha_nacimiento: user.fecha_nacimiento || "",
        genero: user.genero || "",
      }));
    } else if (section === "datos-cuenta") {
      setFormData((prev) => ({
        ...prev,
        phone: user.phone || "",
      }));
    } else if (section === "sobre-mi") {
      setFormData((prev) => ({
        ...prev,
        about_me: user.about_me || "",
      }));
    }
    setEditingSection(null);
  };

  const formatCentsToEuros = (cents) => {
    if (typeof cents !== "number") return "0,00";
    return (cents / 100).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getWalletBalanceEuros = () => {
    if (!walletBalance || walletBalance.length === 0) return "0,00";
    return formatCentsToEuros(walletBalance[0].balance_cents);
  };

  const handleWithdraw = async () => {
    const euros = parseFloat(payoutAmount.replace(",", "."));
    if (!euros || euros <= 0) {
      Alert.alert("Error", "Introduce una cantidad válida.");
      return;
    }
    const cents = Math.round(euros * 100);
    setProcessingPayout(true);
    try {
      await paymentService.createWalletPayout({
        amount: cents,
        currency: "eur",
        method: "standard",
      });
      Alert.alert(
        "Retirada procesada",
        "Tu solicitud de retirada está en proceso.",
      );
      setShowPayoutModal(false);
      setPayoutAmount("");
      fetchWalletData();
    } catch (err) {
      Alert.alert("Error", err.message || "No se pudo procesar la retirada.");
    } finally {
      setProcessingPayout(false);
    }
  };

  const handleViewStripeAccount = async () => {
    try {
      const res = await paymentService.createStripeLoginLink({
        return_url: "youconnext://perfil",
      });
      if (res?.loginLink?.url) {
        await Linking.openURL(res.loginLink.url);
      } else {
        Alert.alert(
          "Aviso",
          "No tienes una cuenta Stripe Connect configurada.",
        );
      }
    } catch (err) {
      Alert.alert(
        "Cuenta no configurada",
        "Primero debes configurar tu cuenta Stripe Connect para acceder al panel.",
      );
    }
  };

  const handleSetupStripeConnect = async () => {
    try {
      await paymentService.createStripeConnect({
        email: user.email,
        country: "ES",
        name: `${user.name} ${user.surname || ""}`.trim(),
      });
    } catch (err) {
      if (
        !err.message?.includes("onboarding") &&
        !err.message?.includes("400")
      ) {
        Alert.alert(
          "Error",
          err.message || "No se pudo crear la cuenta Stripe.",
        );
        return;
      }
    }
    try {
      const linkRes = await paymentService.createStripeLink({
        return_url: "youconnext://perfil",
        refresh_url: "youconnext://perfil",
      });
      if (linkRes?.accountLink?.url) {
        await Linking.openURL(linkRes.accountLink.url);
      } else {
        Alert.alert("Error", "No se pudo generar el link de onboarding.");
      }
    } catch (e) {
      Alert.alert(
        "Error",
        e.message || "No se pudo generar el link de onboarding.",
      );
    }
  };

  const handleSetupPaymentMethod = async () => {
    try {
      const linkRes = await paymentService.createStripeLink({
        return_url: "youconnext://perfil",
        refresh_url: "youconnext://perfil",
      });
      if (linkRes?.accountLink?.url) {
        await Linking.openURL(linkRes.accountLink.url);
      } else {
        Alert.alert("Error", "No se pudo generar el link de onboarding.");
      }
    } catch (err) {
      if (
        err.message?.includes("No tiene cuenta") ||
        err.message?.includes("404")
      ) {
        try {
          await paymentService.createStripeConnect({
            email: user.email,
            country: "ES",
            name: `${user.name} ${user.surname || ""}`.trim(),
          });
          const linkRes2 = await paymentService.createStripeLink({
            return_url: "youconnext://perfil",
            refresh_url: "youconnext://perfil",
          });
          if (linkRes2?.accountLink?.url) {
            await Linking.openURL(linkRes2.accountLink.url);
          } else {
            Alert.alert("Error", "No se pudo generar el link de onboarding.");
          }
        } catch (createErr) {
          Alert.alert(
            "Error",
            createErr.message || "No se pudo crear la cuenta Stripe.",
          );
        }
      } else {
        Alert.alert(
          "Error",
          err.message || "No se pudo generar el link de onboarding.",
        );
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync(false);
      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permisos necesarios",
          "Necesitas conceder acceso a la galería para cambiar tu foto de perfil.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert("Error", "No se pudo procesar la imagen.");
        return;
      }

      const mime = asset.mimeType || "image/jpeg";
      const dataUri = `data:${mime};base64,${asset.base64}`;

      setUploadingImage(true);
      await actualizarUsuario({ img_perfil: dataUri });
      Alert.alert("Éxito", "Foto de perfil actualizada correctamente.");
    } catch (err) {
      Alert.alert(
        "Error",
        err.message || "No se pudo actualizar la foto de perfil.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCocheInputChange = (field, value) => {
    setCocheFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateOrUpdateCoche = async () => {
    const {
      matricula,
      marca,
      modelo,
      color,
      tipo_combustible,
      num_plazas,
      year,
    } = cocheFormData;

    if (!matricula.trim()) {
      Alert.alert("Error", "La matrícula es obligatoria.");
      return;
    }
    if (!marca.trim()) {
      Alert.alert("Error", "La marca es obligatoria.");
      return;
    }
    if (!modelo.trim()) {
      Alert.alert("Error", "El modelo es obligatorio.");
      return;
    }
    if (!num_plazas || isNaN(Number(num_plazas)) || Number(num_plazas) <= 0) {
      Alert.alert("Error", "Introduce un número válido de plazas.");
      return;
    }
    if (
      !year ||
      isNaN(Number(year)) ||
      Number(year) < 1900 ||
      Number(year) > new Date().getFullYear() + 1
    ) {
      Alert.alert("Error", "Introduce un año de fabricación válido.");
      return;
    }

    setSavingCoche(true);
    try {
      const payload = {
        matricula: matricula.trim().toUpperCase(),
        marca: marca.trim(),
        modelo: modelo.trim(),
        color: color.trim() || "Blanco",
        tipo_combustible: tipo_combustible,
        num_plazas: Number(num_plazas),
        year: Number(year),
      };

      if (editingCocheId) {
        const res = await carService.actualizarCoche(editingCocheId, payload);
        if (res && res.status === "Success") {
          Alert.alert("Éxito", "Vehículo actualizado correctamente.");
          setShowCocheForm(false);
          setEditingCocheId(null);
          fetchCoches();
        } else {
          Alert.alert(
            "Error",
            res?.message || "No se pudo actualizar el vehículo.",
          );
        }
      } else {
        const res = await carService.crearCoche(payload);
        if (res && res.status === "Success") {
          Alert.alert("Éxito", "Vehículo registrado correctamente.");
          setShowCocheForm(false);
          fetchCoches();
        } else {
          Alert.alert(
            "Error",
            res?.message || "No se pudo registrar el vehículo.",
          );
        }
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "No se pudo procesar la solicitud.",
      );
    } finally {
      setSavingCoche(false);
    }
  };

  const handleDeleteCoche = (cocheId) => {
    Alert.alert(
      "Eliminar vehículo",
      "¿Estás seguro de que quieres eliminar este vehículo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await carService.eliminarCoche(cocheId);
              if (res && res.status === "Success") {
                Alert.alert("Éxito", "Vehículo eliminado correctamente.");
                fetchCoches();
              } else {
                Alert.alert(
                  "Error",
                  res?.message || "No se pudo eliminar el vehículo.",
                );
              }
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el vehículo.");
            }
          },
        },
      ],
    );
  };

  const handleEditCocheClick = (coche) => {
    setCocheFormData({
      matricula: coche.matricula || "",
      marca: coche.marca || "",
      modelo: coche.modelo || "",
      color: coche.color || "Blanco",
      tipo_combustible: coche.tipo_combustible || "Gasolina",
      num_plazas: String(coche.num_plazas || "5"),
      year: String(coche.year || new Date().getFullYear()),
    });
    setEditingCocheId(coche.id_coche);
    setShowCocheForm(true);
  };

  const handleResetCocheForm = () => {
    setCocheFormData({
      matricula: "",
      marca: "",
      modelo: "",
      color: "Blanco",
      tipo_combustible: "Gasolina",
      num_plazas: "5",
      year: String(new Date().getFullYear()),
    });
    setEditingCocheId(null);
    setShowCocheForm(false);
    setShowMarcaSuggestions(false);
    setShowModeloSuggestions(false);
  };

  const renderSubViewHeader = (title, onBack, onEdit) => (
    <View style={styles.subViewHeader}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={
          onBack ||
          (() => {
            setEditingSection(null);
            setCurrentSubView("menu");
          })
        }
      >
        <ChevronLeft size={24} color={COLORS.gray800} strokeWidth={2.5} />
      </TouchableOpacity>
      <Text style={styles.subViewHeaderTitle}>{title}</Text>
      {onEdit ? (
        <TouchableOpacity style={styles.editHeaderBtn} onPress={onEdit}>
          <Pencil size={18} color={COLORS.secondary} strokeWidth={2.5} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );

  const renderSectionEditButton = (section) => (
    <TouchableOpacity
      style={styles.sectionEditBtn}
      onPress={() => {
        setFormData({
          name: user.name || "",
          surname: user.surname || "",
          email: user.email || "",
          phone: user.phone || "",
          fecha_nacimiento: user.fecha_nacimiento || "",
          genero: user.genero || "",
          about_me: user.about_me || "",
        });
        setEditingSection(section);
      }}
    >
      <Pencil size={16} color={COLORS.secondary} strokeWidth={2.5} />
      <Text style={styles.sectionEditBtnText}>Editar</Text>
    </TouchableOpacity>
  );

  const renderSectionButtons = (section) => (
    <View style={styles.editButtonRow}>
      <TouchableOpacity
        style={[
          styles.saveProfileBtn,
          { flex: 1, backgroundColor: COLORS.gray200 },
        ]}
        onPress={() => handleCancelSection(section)}
        disabled={saving}
      >
        <Text style={[styles.saveProfileBtnText, { color: COLORS.gray700 }]}>
          Cancelar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.saveProfileBtn, { flex: 2 }]}
        onPress={() => handleSaveSection(section)}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.saveProfileBtnText}>Guardar</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderProfileView = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.sectionContent}
      keyboardVerticalOffset={Platform.OS === "android" ? 0 : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sectionScroll}
        keyboardShouldPersistTaps="handled"
      >
        {renderSubViewHeader("Mi perfil")}

        {/* Avatar con imagen y botón de editar */}
        <View style={styles.editAvatarSection}>
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={uploadingImage}
            activeOpacity={0.8}
          >
            <View style={styles.editAvatarWithCamera}>
              {user.img_perfil ? (
                <Image
                  source={{ uri: user.img_perfil }}
                  style={styles.editAvatarImage}
                />
              ) : (
                <View style={styles.editAvatar}>
                  <Text style={styles.editAvatarText}>
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}
              <View style={styles.editAvatarCameraBtn}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Camera size={16} color={COLORS.white} strokeWidth={2.5} />
                )}
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.editAvatarHint}>
            {user.name} {user.surname}
          </Text>
          <Text style={styles.editAvatarSubHint}>
            Toca la imagen para cambiar tu foto
          </Text>
        </View>

        {/* SECCIÓN 1: DATOS PERSONALES */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <UserIcon size={20} color={COLORS.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.sectionTitle}>Datos personales</Text>
            {editingSection !== "datos-personales" &&
              renderSectionEditButton("datos-personales")}
          </View>

          {editingSection === "datos-personales" ? (
            <>
              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Nombre</Text>
                <View style={styles.editInputWrapper}>
                  <UserIcon size={18} color={COLORS.gray400} strokeWidth={2} />
                  <TextInput
                    style={styles.editInput}
                    value={formData.name}
                    onChangeText={(v) => handleInputChange("name", v)}
                    placeholder="Tu nombre"
                    placeholderTextColor={COLORS.gray400}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Apellidos</Text>
                <View style={styles.editInputWrapper}>
                  <UserIcon size={18} color={COLORS.gray400} strokeWidth={2} />
                  <TextInput
                    style={styles.editInput}
                    value={formData.surname}
                    onChangeText={(v) => handleInputChange("surname", v)}
                    placeholder="Tus apellidos"
                    placeholderTextColor={COLORS.gray400}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Fecha de nacimiento</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.editInputWrapper}>
                    <Calendar
                      size={18}
                      color={COLORS.gray400}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.editInput,
                        !formData.fecha_nacimiento &&
                          styles.editInputPlaceholder,
                      ]}
                    >
                      {formData.fecha_nacimiento
                        ? new Date(
                            formData.fecha_nacimiento,
                          ).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "Seleccionar fecha"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Género</Text>
                <View style={styles.genderPicker}>
                  {["Masculino", "Femenino", "Otro"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.genderOption,
                        formData.genero === g && styles.genderOptionSelected,
                      ]}
                      onPress={() => handleInputChange("genero", g)}
                    >
                      <View
                        style={[
                          styles.genderRadio,
                          formData.genero === g && styles.genderRadioSelected,
                        ]}
                      />
                      <Text
                        style={[
                          styles.genderOptionText,
                          formData.genero === g &&
                            styles.genderOptionTextSelected,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {renderSectionButtons("datos-personales")}
            </>
          ) : (
            <>
              <View style={styles.viewField}>
                <Text style={styles.viewFieldLabel}>Nombre</Text>
                <Text style={styles.viewFieldValue}>
                  {user.name || "No especificado"}
                </Text>
              </View>
              <View style={styles.viewField}>
                <Text style={styles.viewFieldLabel}>Apellidos</Text>
                <Text style={styles.viewFieldValue}>
                  {user.surname || "No especificado"}
                </Text>
              </View>
              <View style={styles.viewField}>
                <Text style={styles.viewFieldLabel}>Fecha de nacimiento</Text>
                <Text style={styles.viewFieldValue}>
                  {user.fecha_nacimiento
                    ? new Date(user.fecha_nacimiento).toLocaleDateString(
                        "es-ES",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "No especificada"}
                </Text>
              </View>
              <View style={styles.viewField}>
                <Text style={styles.viewFieldLabel}>Género</Text>
                <Text style={styles.viewFieldValue}>
                  {user.genero || "No especificado"}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* SECCIÓN 2: DATOS DE LA CUENTA */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <Shield size={20} color={COLORS.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.sectionTitle}>Datos de la cuenta</Text>
            {editingSection !== "datos-cuenta" &&
              renderSectionEditButton("datos-cuenta")}
          </View>

          {editingSection === "datos-cuenta" ? (
            <>
              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Correo electrónico</Text>
                <View style={styles.editInputWrapper}>
                  <Mail size={18} color={COLORS.gray400} strokeWidth={2} />
                  <TextInput
                    value={formData.email}
                    onChangeText={(v) => handleInputChange("email", v)}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={false}
                    style={[styles.editInput, { color: COLORS.gray500 }]}
                  />
                </View>
              </View>
              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Teléfono</Text>
                <View style={styles.editInputWrapper}>
                  <Phone size={18} color={COLORS.gray400} strokeWidth={2} />
                  <TextInput
                    style={styles.editInput}
                    value={formData.phone}
                    onChangeText={(v) => handleInputChange("phone", v)}
                    placeholder="600 000 000"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
              {renderSectionButtons("datos-cuenta")}
            </>
          ) : (
            <>
              <View style={styles.viewField}>
                <Text style={styles.viewFieldLabel}>Correo electrónico</Text>
                <Text style={styles.viewFieldValue}>
                  {user.email || "No especificado"}
                </Text>
              </View>
              <View style={styles.viewField}>
                <Text style={styles.viewFieldLabel}>Teléfono</Text>
                <Text style={styles.viewFieldValue}>
                  {user.phone || "No especificado"}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* SECCIÓN 3: SOBRE MÍ */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <Pencil size={20} color={COLORS.secondary} strokeWidth={2.5} />
            </View>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            {editingSection !== "sobre-mi" &&
              renderSectionEditButton("sobre-mi")}
          </View>

          {editingSection === "sobre-mi" ? (
            <>
              <View style={styles.editField}>
                <Text style={styles.editFieldLabel}>Descripción</Text>
                <TextInput
                  style={[styles.editInput, styles.aboutMeInput]}
                  value={formData.about_me}
                  onChangeText={(v) => handleInputChange("about_me", v)}
                  placeholder="Cuéntanos algo sobre ti..."
                  placeholderTextColor={COLORS.gray400}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <Text style={styles.aboutMeHint}>
                  {formData.about_me?.length || 0}/500 caracteres
                </Text>
              </View>
              {renderSectionButtons("sobre-mi")}
            </>
          ) : (
            <Text style={styles.viewAboutMe}>
              {user.about_me || "Aún no has añadido una descripción sobre ti."}
            </Text>
          )}
        </View>

        {/* SECCIÓN 4: VALORACIONES (solo lectura) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconWrapper}>
              <Award size={20} color={COLORS.warning} strokeWidth={2.5} />
            </View>
            <Text style={styles.sectionTitle}>Valoraciones</Text>
          </View>

          <View style={styles.ratingsCard}>
            <View style={styles.ratingSummary}>
              <View style={styles.ratingMain}>
                <Text style={styles.ratingValue}>
                  {user.averageRating ? user.averageRating.toFixed(1) : "5.0"}
                </Text>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={16}
                      color={
                        i <= Math.round(user.averageRating || 5)
                          ? COLORS.warning
                          : COLORS.gray300
                      }
                      fill={
                        i <= Math.round(user.averageRating || 5)
                          ? COLORS.warning
                          : "none"
                      }
                      strokeWidth={2}
                    />
                  ))}
                </View>
                <Text style={styles.ratingCount}>
                  {user.numOpinions || 0} valoraciones
                </Text>
              </View>
              <View style={styles.ratingAction}>
                <Text style={styles.ratingActionText}>
                  {user.myNumOpinions || 0} opiniones escritas
                </Text>
                <ChevronRight
                  size={18}
                  color={COLORS.gray400}
                  strokeWidth={2}
                />
              </View>
            </View>
            <View style={styles.ratingDivider} />
            <View style={styles.ratingInfo}>
              <TouchableOpacity style={styles.ratingInfoRow}>
                <View style={styles.ratingInfoIcon}>
                  <MessageSquare
                    size={18}
                    color={COLORS.primary}
                    strokeWidth={2}
                  />
                </View>
                <Text style={styles.ratingInfoText}>Ver mis opiniones</Text>
                <ChevronRight
                  size={16}
                  color={COLORS.gray400}
                  strokeWidth={2}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.ratingInfoRow}>
                <View style={styles.ratingInfoIcon}>
                  <Info size={18} color={COLORS.primary} strokeWidth={2} />
                </View>
                <Text style={styles.ratingInfoText}>Cómo se calcula</Text>
                <ChevronRight
                  size={16}
                  color={COLORS.gray400}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />

        {showDatePicker && (
          <DateTimePicker
            value={datePickerDate}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={handleDateChange}
            textColor={COLORS.primary}
            accentColor={COLORS.primary}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderMainMenu = () => {
    return (
      <ScrollView
        style={styles.sectionContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuScroll}
      >
        {/* Cabecera integrada */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.headerAvatarContainer}>
            <View style={styles.headerAvatarRing}>
              {user.img_perfil ? (
                <Image
                  source={{ uri: user.img_perfil }}
                  style={styles.avatarMainImage}
                />
              ) : (
                <View style={styles.avatarMain}>
                  <Text style={styles.avatarTextMain}>
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerTextInfo}>
            <Text style={styles.profileMainName}>
              {user.name} {user.surname}
            </Text>
            <Text style={styles.profileCompletionHint}>
              Perfil completo al 66%
            </Text>
          </View>
        </View>

        {/* Tarjeta de Ahorro generado */}
        <View style={styles.savingsCard}>
          <View style={styles.savingsLeft}>
            <View style={styles.savingsIconLabelRow}>
              <TrendingUp size={16} color="#10B981" strokeWidth={2.5} />
              <Text style={styles.savingsLabel}>Saldo del monedero</Text>
              <View style={styles.infoCircle}>
                <Text style={styles.infoCircleText}>i</Text>
              </View>
            </View>
            <Text style={styles.savingsDate}>Disponible para retirar</Text>
          </View>
          <Text style={styles.savingsValue}>{getWalletBalanceEuros()} €</Text>
        </View>

        {/* Bloque de estadísticas de 3 columnas */}
        <View style={styles.statsCardBlock}>
          <View style={styles.statsCol}>
            <Text style={styles.statsValueNumber}>{user.viajes || 5}</Text>
            <Text style={styles.statsColLabel}>Viajes</Text>
            <Text style={styles.statsColLabel}>realizados</Text>
          </View>
          <View style={styles.statsDividerLine} />
          <View style={styles.statsCol}>
            <Text style={styles.statsValueNumber}>35</Text>
            <Text style={styles.statsColLabel}>CO2 (kg)</Text>
            <Text style={styles.statsColLabel}>ahorrado</Text>
          </View>
          <View style={styles.statsDividerLine} />
          <View style={styles.statsCol}>
            <Text style={styles.statsValueNumber}>{user.numOpinions || 0}</Text>
            <Text style={styles.statsColLabel}>Amigos</Text>
            <Text style={styles.statsColLabel}>invitados</Text>
          </View>
        </View>

        {/* Menú de Opciones */}
        <View style={styles.menuItemsBlock}>
          <TouchableOpacity
            style={styles.menuRowItem}
            onPress={() => setCurrentSubView("mi-perfil")}
          >
            <View style={styles.menuRowLeft}>
              <UserIcon size={22} color={COLORS.gray800} strokeWidth={1.8} />
              <Text style={styles.menuRowText}>Mi perfil</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRowItem}
            onPress={() =>
              Alert.alert(
                "Mis direcciones",
                "Gestiona tus direcciones de forma rapida en la seleccion de destino.",
              )
            }
          >
            <View style={styles.menuRowLeft}>
              <MapPin size={22} color={COLORS.gray800} strokeWidth={1.8} />
              <Text style={styles.menuRowText}>Mis direcciones</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRowItem}
            onPress={() => setCurrentSubView("rutinas")}
          >
            <View style={styles.menuRowLeft}>
              <Calendar size={22} color={COLORS.gray800} strokeWidth={1.8} />
              <Text style={styles.menuRowText}>Mi rutina</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRowItem}
            onPress={() => setCurrentSubView("mis-vehiculos")}
          >
            <View style={styles.menuRowLeft}>
              <Car size={22} color={COLORS.gray800} strokeWidth={1.8} />
              <Text style={styles.menuRowText}>Mis vehículos</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRowItem}
            onPress={() => setCurrentSubView("historial")}
          >
            <View style={styles.menuRowLeft}>
              <History size={22} color={COLORS.gray800} strokeWidth={1.8} />
              <Text style={styles.menuRowText}>Historial de trayectos</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRowItem}
            onPress={() =>
              Alert.alert(
                "Mi empresa/universidad",
                "Esta funcionalidad te permite vincular tu perfil a tu centro oficial para viajes restringidos.",
              )
            }
          >
            <View style={styles.menuRowLeft}>
              <Building size={22} color={COLORS.gray800} strokeWidth={1.8} />
              <Text style={styles.menuRowText}>Mi empresa/universidad</Text>
            </View>
          </TouchableOpacity>

          {/* Separador de Sección del Menú */}
          <View style={styles.menuSectionDivider} />

          <TouchableOpacity
            style={styles.menuRowItem}
            onPress={() =>
              Alert.alert(
                "Favoritos",
                "Tus viajes y conductores favoritos apareceran aqui.",
              )
            }
          >
            <View style={styles.menuRowLeft}>
              <Heart size={22} color={COLORS.gray800} strokeWidth={1.8} />
              <Text style={styles.menuRowText}>Favoritos</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRowItem}
            onPress={() =>
              Alert.alert(
                "Valoraciones",
                `Tienes una valoracion media de ${user.averageRating ? user.averageRating.toFixed(1) : "5.0"} estrellas.`,
              )
            }
          >
            <View style={styles.menuRowLeft}>
              <Star size={22} color={COLORS.gray800} strokeWidth={1.8} />
              <Text style={styles.menuRowText}>Valoraciones</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRowItem}
            onPress={() => setCurrentSubView("monedero")}
          >
            <View style={styles.menuRowLeft}>
              <Wallet size={22} color={COLORS.gray800} strokeWidth={1.8} />
              <Text style={styles.menuRowText}>Monedero</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity style={styles.menuLogoutButton} onPress={onLogout}>
          <LogOut size={18} color={COLORS.error} strokeWidth={2.5} />
          <Text style={styles.menuLogoutText}>Cerrar sesion</Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    );
  };

  const renderViajesSection = () => {
    if (loadingViajes) {
      return (
        <ScrollView
          style={styles.sectionContent}
          showsVerticalScrollIndicator={false}
        >
          {renderSubViewHeader("Historial de trayectos")}
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando tus viajes...</Text>
          </View>
        </ScrollView>
      );
    }

    if (errorViajes) {
      return (
        <ScrollView
          style={styles.sectionContent}
          showsVerticalScrollIndicator={false}
        >
          {renderSubViewHeader("Historial de trayectos")}
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{errorViajes}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchViajes}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    if (viajes.length === 0) {
      return (
        <ScrollView
          style={styles.sectionContent}
          showsVerticalScrollIndicator={false}
        >
          {renderSubViewHeader("Historial de trayectos")}
          <View style={styles.centerContainer}>
            <View style={styles.placeholderIconBg}>
              <Route size={40} color={COLORS.gray300} strokeWidth={1.5} />
            </View>
            <Text style={styles.placeholderTitle}>Sin viajes programados</Text>
            <Text style={styles.placeholderSubtitle}>
              Aun no tienes trayectos publicados ni reservas de viaje activas.
            </Text>
          </View>
        </ScrollView>
      );
    }

    const viajesAgrupados = agruparViajesPorFecha(viajes);
    const keys = Object.keys(viajesAgrupados);

    return (
      <ScrollView
        style={styles.sectionContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.viajesScrollContent}
      >
        {renderSubViewHeader("Historial de trayectos")}
        {keys.map((fecha) => (
          <View key={fecha} style={styles.fechaGrupoContainer}>
            <Text style={styles.fechaGrupoTitulo}>{fecha}</Text>
            {viajesAgrupados[fecha].map((viaje) => {
              const esConductor = viaje.rol === "conductor";
              const isEnCurso =
                viaje.status === "en curso" || viaje.status === "activo";
              const formattedTime = viaje.hora
                ? new Date(viaje.hora).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--";

              return (
                <TouchableOpacity
                  key={viaje.keyId}
                  style={styles.viajeCard}
                  onPress={() => {
                    if (isEnCurso) {
                      navigation.navigate("ViajeEnCurso", {
                        viaje: viaje.originalData,
                      });
                    } else {
                      navigation.navigate("ViajeDetalle", {
                        viaje: viaje.originalData,
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {/* Card Header */}
                  <View style={styles.viajeCardHeader}>
                    <View style={styles.badgeWrapper}>
                      <View
                        style={[
                          styles.rolBadge,
                          esConductor
                            ? styles.conductorBadge
                            : styles.pasajeroBadge,
                        ]}
                      >
                        {esConductor ? (
                          <Car
                            size={12}
                            color={COLORS.primary}
                            strokeWidth={2.5}
                          />
                        ) : (
                          <UserIcon
                            size={12}
                            color={COLORS.secondary}
                            strokeWidth={2.5}
                          />
                        )}
                        <Text
                          style={[
                            styles.rolBadgeText,
                            esConductor
                              ? styles.conductorBadgeText
                              : styles.pasajeroBadgeText,
                          ]}
                        >
                          {esConductor ? "Conductor" : "Pasajero"}
                        </Text>
                      </View>

                      {/* Estado del trayecto */}
                      <View
                        style={[
                          styles.statusBadge,
                          viaje.status === "finalizado"
                            ? styles.successStatusBadge
                            : isEnCurso
                              ? styles.activeStatusBadge
                              : styles.pendingStatusBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            viaje.status === "finalizado"
                              ? styles.successStatusBadgeText
                              : isEnCurso
                                ? styles.activeStatusBadgeText
                                : styles.pendingStatusBadgeText,
                          ]}
                        >
                          {viaje.status.charAt(0).toUpperCase() +
                            viaje.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.viajePrice}>
                      {viaje.precio != null ? `${viaje.precio}€` : "Gratis"}
                    </Text>
                  </View>

                  {/* Card Route */}
                  <View style={styles.viajeCardRoute}>
                    <View style={styles.routeTimeline}>
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: COLORS.primary },
                        ]}
                      />
                      <View style={styles.timelineLine} />
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: COLORS.secondary },
                        ]}
                      />
                    </View>

                    <View style={styles.routePlaces}>
                      <Text style={styles.routePlaceText} numberOfLines={1}>
                        {viaje.origen}
                      </Text>
                      <Text style={styles.routePlaceText} numberOfLines={1}>
                        {viaje.destino}
                      </Text>
                    </View>
                  </View>

                  {/* Card Footer */}
                  <View style={styles.viajeCardFooter}>
                    <View style={styles.footerInfoRow}>
                      <View style={styles.footerInfoItem}>
                        <Clock
                          size={14}
                          color={COLORS.gray500}
                          strokeWidth={2}
                        />
                        <Text style={styles.footerInfoText}>
                          {formattedTime} h
                        </Text>
                      </View>

                      <View style={styles.footerInfoItem}>
                        <Users
                          size={14}
                          color={COLORS.gray500}
                          strokeWidth={2}
                        />
                        <Text style={styles.footerInfoText} numberOfLines={1}>
                          {esConductor
                            ? `${viaje.disponible || 0} plazas libres`
                            : `Con: ${viaje.conductorName}`}
                        </Text>
                      </View>
                    </View>

                    <ChevronRight
                      size={16}
                      color={COLORS.gray400}
                      strokeWidth={2.5}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    );
  };

  const renderVehiculosSection = () => {
    // Si se está mostrando el formulario de creación/edición de coche
    if (showCocheForm) {
      const marcasSugeridas = Object.keys(POPULAR_CARS).filter((m) =>
        m.toLowerCase().includes((cocheFormData.marca || "").toLowerCase()),
      );

      const modelosDeMarca = POPULAR_CARS[cocheFormData.marca] || [];
      const modelosSugeridos = modelosDeMarca.filter((mod) =>
        mod.toLowerCase().includes((cocheFormData.modelo || "").toLowerCase()),
      );

      return (
        <ScrollView
          style={styles.sectionContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sectionScroll}
          keyboardShouldPersistTaps="handled"
        >
          {renderSubViewHeader(
            editingCocheId ? "Editar vehículo" : "Registrar vehículo",
            handleResetCocheForm,
          )}

          <View style={styles.editFormCard}>
            {/* Matrícula */}
            <View style={styles.editField}>
              <Text style={styles.editFieldLabel}>Matrícula</Text>
              <View style={styles.editInputWrapper}>
                <Car size={18} color={COLORS.gray400} strokeWidth={2} />
                <TextInput
                  style={[styles.editInput, { textTransform: "uppercase" }]}
                  value={cocheFormData.matricula}
                  onChangeText={(v) =>
                    handleCocheInputChange("matricula", v.toUpperCase())
                  }
                  placeholder="Ej: 1234ABC"
                  placeholderTextColor={COLORS.gray400}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Marca (Con Autocompletado) */}
            <View style={styles.editField}>
              <Text style={styles.editFieldLabel}>Marca</Text>
              <View style={styles.editInputWrapper}>
                <Sparkles size={18} color={COLORS.gray400} strokeWidth={2} />
                <TextInput
                  style={styles.editInput}
                  value={cocheFormData.marca}
                  onChangeText={(v) => {
                    handleCocheInputChange("marca", v);
                    handleCocheInputChange("modelo", ""); // resetear modelo al cambiar de marca
                    setShowMarcaSuggestions(true);
                  }}
                  onFocus={() => setShowMarcaSuggestions(true)}
                  placeholder="Ej: Toyota"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
              {showMarcaSuggestions &&
                cocheFormData.marca.trim().length > 0 &&
                marcasSugeridas.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {marcasSugeridas.slice(0, 5).map((marca) => (
                      <TouchableOpacity
                        key={marca}
                        style={styles.suggestionItem}
                        onPress={() => {
                          handleCocheInputChange("marca", marca);
                          setShowMarcaSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{marca}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
            </View>

            {/* Modelo (Con Autocompletado) */}
            <View style={styles.editField}>
              <Text style={styles.editFieldLabel}>Modelo</Text>
              <View style={styles.editInputWrapper}>
                <Sparkles size={18} color={COLORS.gray400} strokeWidth={2} />
                <TextInput
                  style={styles.editInput}
                  value={cocheFormData.modelo}
                  onChangeText={(v) => {
                    handleCocheInputChange("modelo", v);
                    setShowModeloSuggestions(true);
                  }}
                  onFocus={() => setShowModeloSuggestions(true)}
                  disabled={!cocheFormData.marca}
                  placeholder={
                    cocheFormData.marca
                      ? "Ej: Corolla"
                      : "Primero selecciona una marca"
                  }
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
              {showModeloSuggestions &&
                cocheFormData.modelo.trim().length > 0 &&
                modelosSugeridos.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {modelosSugeridos.slice(0, 5).map((modelo) => (
                      <TouchableOpacity
                        key={modelo}
                        style={styles.suggestionItem}
                        onPress={() => {
                          handleCocheInputChange("modelo", modelo);
                          setShowModeloSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{modelo}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
            </View>

            {/* Tipo de Combustible (Botones de Chip Modernos) */}
            <View style={styles.editField}>
              <Text style={styles.editFieldLabel}>Tipo de combustible</Text>
              <View style={styles.chipsRow}>
                {FUEL_TYPES.map((fuel) => {
                  const seleccionado =
                    cocheFormData.tipo_combustible === fuel.value;
                  return (
                    <TouchableOpacity
                      key={fuel.value}
                      style={[
                        styles.chipBtn,
                        seleccionado && styles.chipBtnSelected,
                      ]}
                      onPress={() =>
                        handleCocheInputChange("tipo_combustible", fuel.value)
                      }
                    >
                      <Text
                        style={[
                          styles.chipBtnText,
                          seleccionado && styles.chipBtnTextSelected,
                        ]}
                      >
                        {fuel.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Color */}
            <View style={styles.editField}>
              <Text style={styles.editFieldLabel}>Color</Text>
              <View style={styles.chipsRow}>
                {CAR_COLORS.slice(0, 6).map((col) => {
                  const seleccionado = cocheFormData.color === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      style={[
                        styles.colorChipBtn,
                        seleccionado && styles.colorChipBtnSelected,
                      ]}
                      onPress={() => handleCocheInputChange("color", col)}
                    >
                      <Text
                        style={[
                          styles.colorChipText,
                          seleccionado && styles.colorChipTextSelected,
                        ]}
                      >
                        {col}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: SPACING.md }}>
              {/* Número de Plazas */}
              <View style={[styles.editField, { flex: 1 }]}>
                <Text style={styles.editFieldLabel}>Número de plazas</Text>
                <View style={styles.editInputWrapper}>
                  <Users size={18} color={COLORS.gray400} strokeWidth={2} />
                  <TextInput
                    style={styles.editInput}
                    value={cocheFormData.num_plazas}
                    onChangeText={(v) =>
                      handleCocheInputChange("num_plazas", v)
                    }
                    placeholder="Ej: 5"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                </View>
              </View>

              {/* Año de fabricación */}
              <View style={[styles.editField, { flex: 1 }]}>
                <Text style={styles.editFieldLabel}>Año fabricación</Text>
                <View style={styles.editInputWrapper}>
                  <Calendar size={18} color={COLORS.gray400} strokeWidth={2} />
                  <TextInput
                    style={styles.editInput}
                    value={cocheFormData.year}
                    onChangeText={(v) => handleCocheInputChange("year", v)}
                    placeholder="Ej: 2020"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: SPACING.md,
              marginTop: SPACING.md,
            }}
          >
            <TouchableOpacity
              style={[
                styles.saveProfileBtn,
                { flex: 1, backgroundColor: COLORS.gray300 },
              ]}
              onPress={handleResetCocheForm}
            >
              <Text
                style={[styles.saveProfileBtnText, { color: COLORS.gray700 }]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveProfileBtn, { flex: 2 }]}
              onPress={handleCreateOrUpdateCoche}
              disabled={savingCoche}
            >
              {savingCoche ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.saveProfileBtnText}>
                  {editingCocheId ? "Actualizar" : "Registrar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      );
    }

    // Listado de vehículos registrados
    return (
      <ScrollView
        style={styles.sectionContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sectionScroll}
      >
        {renderSubViewHeader("Mis vehículos")}

        {/* Botón para añadir coche */}
        <TouchableOpacity
          style={styles.addCocheMainBtn}
          onPress={() => setShowCocheForm(true)}
        >
          <Sparkles size={20} color={COLORS.white} strokeWidth={2} />
          <Text style={styles.addCocheMainBtnText}>
            Registrar nuevo vehículo
          </Text>
        </TouchableOpacity>

        {loadingCoches ? (
          <View style={[styles.centerContainer, { minHeight: 200 }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando tus vehículos...</Text>
          </View>
        ) : errorCoches ? (
          <View style={[styles.centerContainer, { minHeight: 200 }]}>
            <Text style={styles.errorText}>{errorCoches}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCoches}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : coches.length === 0 ? (
          <View style={[styles.centerContainer, { minHeight: 240 }]}>
            <View style={styles.placeholderIconBg}>
              <Car size={40} color={COLORS.gray300} strokeWidth={1.5} />
            </View>
            <Text style={styles.placeholderTitle}>
              Sin vehículos registrados
            </Text>
            <Text style={styles.placeholderSubtitle}>
              Registra tu vehículo para poder publicar trayectos como conductor
              y compartir gastos de viaje.
            </Text>
          </View>
        ) : (
          <View style={styles.cochesListContainer}>
            {coches.map((coche) => {
              // Formatear matrícula para la visualización de la placa
              const matOriginal = coche.matricula || "";
              const matriculaFormateada =
                matOriginal.length === 7
                  ? `${matOriginal.substring(0, 4)} ${matOriginal.substring(4)}`
                  : matOriginal;

              return (
                <View
                  key={coche.id_coche || coche.matricula}
                  style={styles.cocheItemCard}
                >
                  {/* Fila superior con marca, modelo y acciones */}
                  <View style={styles.cocheCardHeader}>
                    <View style={styles.cocheCardInfoMain}>
                      <View style={styles.cocheCardIconContainer}>
                        <Car size={22} color={COLORS.primary} strokeWidth={2} />
                      </View>
                      <View>
                        <Text style={styles.cocheCardBrandModel}>
                          {coche.marca} {coche.modelo}
                        </Text>
                        <Text style={styles.cocheCardColorYear}>
                          {coche.color || "Blanco"} • Año {coche.year || "2020"}
                        </Text>
                      </View>
                    </View>

                    {/* Acciones */}
                    <View style={styles.cocheCardActions}>
                      <TouchableOpacity
                        style={styles.cocheActionBtn}
                        onPress={() => handleEditCocheClick(coche)}
                      >
                        <Pencil
                          size={15}
                          color={COLORS.gray600}
                          strokeWidth={2.2}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.cocheActionBtn,
                          styles.cocheActionBtnDelete,
                        ]}
                        onPress={() => handleDeleteCoche(coche.id_coche)}
                      >
                        <X size={15} color={COLORS.error} strokeWidth={2.5} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Placa de Matrícula Realista */}
                  <View style={styles.matriculaPlacaOuter}>
                    <View style={styles.matriculaPlacaInner}>
                      {/* Banda europea */}
                      <View style={styles.placaBandaUE}>
                        <Text style={styles.placaStars}>★</Text>
                        <Text style={styles.placaPais}>E</Text>
                      </View>
                      {/* Dígitos */}
                      <View style={styles.placaDigitosContainer}>
                        <Text style={styles.placaDigitosText}>
                          {matriculaFormateada}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Características secundarias */}
                  <View style={styles.cocheSpecsRow}>
                    <View style={styles.cocheSpecBadge}>
                      <Users size={13} color={COLORS.gray500} strokeWidth={2} />
                      <Text style={styles.cocheSpecText}>
                        {coche.num_plazas || 5} plazas
                      </Text>
                    </View>
                    <View style={styles.cocheSpecBadge}>
                      <View
                        style={[
                          styles.combustibleIndicatorDot,
                          {
                            backgroundColor:
                              coche.tipo_combustible?.toLowerCase() ===
                              "electrico"
                                ? "#10B981"
                                : coche.tipo_combustible?.toLowerCase() ===
                                    "hibrido"
                                  ? "#3B82F6"
                                  : "#F59E0B",
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.cocheSpecText,
                          { textTransform: "capitalize" },
                        ]}
                      >
                        {coche.tipo_combustible || "Gasolina"}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    );
  };

  const renderPlaceholder = (title, subtitle, Icon) => (
    <View style={styles.placeholderContainer}>
      <View style={styles.placeholderIconBg}>
        <Icon size={40} color={COLORS.gray300} strokeWidth={1.5} />
      </View>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderMonederoSection = () => (
    <ScrollView
      style={styles.sectionContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.sectionScroll}
    >
      {renderSubViewHeader("Monedero")}

      {/* Tarjeta de saldo principal */}
      <View style={styles.walletBalanceCard}>
        <View style={styles.walletBalanceHeader}>
          <View style={styles.walletIconWrapper}>
            <Wallet size={24} color={COLORS.white} strokeWidth={2} />
          </View>
          <Text style={styles.walletBalanceLabel}>Saldo disponible</Text>
        </View>
        <Text style={styles.walletBalanceAmount}>
          {getWalletBalanceEuros()} €
        </Text>
        <Text style={styles.walletBalanceHint}>
          Monedero virtual YouConnext
        </Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.walletActionsRow}>
        <TouchableOpacity
          style={styles.walletActionBtn}
          onPress={() => setShowPayoutModal(true)}
        >
          <View style={styles.walletActionIcon}>
            <ArrowUpFromLine
              size={20}
              color={COLORS.secondary}
              strokeWidth={2.5}
            />
          </View>
          <Text style={styles.walletActionText}>Retirar saldo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.walletActionBtn}
          onPress={handleViewStripeAccount}
        >
          <View style={styles.walletActionIcon}>
            <ExternalLink
              size={20}
              color={COLORS.secondary}
              strokeWidth={2.5}
            />
          </View>
          <Text style={styles.walletActionText}>Ver cuenta Stripe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.walletActionBtn}
          onPress={handleSetupPaymentMethod}
        >
          <View style={styles.walletActionIcon}>
            <CreditCard size={20} color={COLORS.secondary} strokeWidth={2.5} />
          </View>
          <Text style={styles.walletActionText}>Método de pago</Text>
        </TouchableOpacity>
      </View>

      {/* Configuración Stripe Connect */}
      <TouchableOpacity
        style={styles.stripeConnectCard}
        onPress={handleSetupStripeConnect}
      >
        <View style={styles.stripeConnectLeft}>
          <View style={styles.stripeConnectIcon}>
            <CreditCard size={22} color={COLORS.primary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stripeConnectTitle}>
              Configurar cuenta Stripe
            </Text>
            <Text style={styles.stripeConnectSubtitle}>
              Configura tu cuenta para recibir pagos y retirar saldo
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={COLORS.gray400} strokeWidth={2} />
      </TouchableOpacity>

      {/* Cuentas vinculadas (tarjetas y bancos) */}
      <View>
        <Text style={styles.linkedAccountsTitle}>Mis métodos de cobro</Text>
        {loadingWallet ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ paddingVertical: SPACING.xl }}
          />
        ) : linkedAccounts.length === 0 ? (
          <View style={styles.walletSectionCard}>
            <Text style={styles.walletEmptyText}>
              No tienes métodos de cobro vinculados. Configura tu cuenta Stripe
              para añadir tarjetas y cuentas bancarias.
            </Text>
          </View>
        ) : (
          <View style={styles.linkedAccountsList}>
            {linkedAccounts.map((cuenta, idx) =>
              cuenta.tipo === "tarjeta" ? (
                <View
                  key={`card-${idx}`}
                  style={[
                    styles.bankCard,
                    cuenta.marca?.toLowerCase() === "visa" &&
                      styles.bankCardVisa,
                    cuenta.marca?.toLowerCase() === "mastercard" &&
                      styles.bankCardMastercard,
                    cuenta.marca?.toLowerCase() === "amex" &&
                      styles.bankCardAmex,
                  ]}
                >
                  <View style={styles.bankCardTop}>
                    <View style={styles.bankCardChip} />
                    <Text style={styles.bankCardBrand}>
                      {cuenta.marca || "Tarjeta"}
                    </Text>
                  </View>
                  <Text style={styles.bankCardNumber}>
                    •••• •••• •••• {cuenta.ultimos4}
                  </Text>
                  <View style={styles.bankCardBottom}>
                    <View>
                      <Text style={styles.bankCardLabel}>Caducidad</Text>
                      <Text style={styles.bankCardValue}>
                        {cuenta.caducidad || "—"}
                      </Text>
                    </View>
                    <View style={styles.bankCardBrandCircle}>
                      <Text style={styles.bankCardBrandCircleText}>
                        {cuenta.marca?.slice(0, 1).toUpperCase() || "T"}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View key={`bank-${idx}`} style={styles.bankAccountCard}>
                  <View style={styles.bankAccountLeft}>
                    <View style={styles.bankAccountIcon}>
                      <CreditCard
                        size={20}
                        color={COLORS.primary}
                        strokeWidth={2}
                      />
                    </View>
                    <View>
                      <Text style={styles.bankAccountBank}>
                        {cuenta.banco || "Cuenta bancaria"}
                      </Text>
                      <Text style={styles.bankAccountIban}>
                        •••• {cuenta.ultimos4}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bankAccountRight}>
                    <Text
                      style={[
                        styles.bankAccountStatus,
                        cuenta.estado === "validated" && {
                          color: COLORS.success,
                        },
                        cuenta.estado === "new" && {
                          color: COLORS.warning,
                        },
                        cuenta.estado === "errored" && {
                          color: COLORS.error,
                        },
                      ]}
                    >
                      {cuenta.estado === "validated"
                        ? "Validada"
                        : cuenta.estado === "new"
                          ? "Pendiente"
                          : cuenta.estado === "errored"
                            ? "Error"
                            : cuenta.estado}
                    </Text>
                    <Text style={styles.bankAccountCurrency}>
                      {(cuenta.moneda || "eur").toUpperCase()}
                    </Text>
                  </View>
                </View>
              ),
            )}
          </View>
        )}
      </View>

      {/* Transacciones recientes */}
      <View style={styles.walletSectionCard}>
        <Text style={styles.walletSectionTitle}>Transacciones recientes</Text>
        {loadingWallet ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ paddingVertical: SPACING.xl }}
          />
        ) : walletError ? (
          <View style={{ alignItems: "center", paddingVertical: SPACING.lg }}>
            <Text style={styles.walletErrorText}>{walletError}</Text>
            <TouchableOpacity
              style={styles.walletRetryBtn}
              onPress={fetchWalletData}
            >
              <Text style={styles.walletRetryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : walletTransactions.length === 0 ? (
          <Text style={styles.walletEmptyText}>
            No hay transacciones recientes.
          </Text>
        ) : (
          walletTransactions.slice(0, 10).map((tx) => (
            <View key={tx.id} style={styles.walletTxRow}>
              <View style={styles.walletTxIcon}>
                {tx.type === "deposit" ? (
                  <ArrowDownToLine
                    size={16}
                    color={COLORS.success}
                    strokeWidth={2.5}
                  />
                ) : (
                  <ArrowUpFromLine
                    size={16}
                    color={COLORS.error}
                    strokeWidth={2.5}
                  />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.walletTxDesc}>
                  {tx.description ||
                    (tx.type === "deposit" ? "Recarga" : "Retirada")}
                </Text>
                <Text style={styles.walletTxDate}>
                  {new Date(tx.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <Text
                style={[
                  styles.walletTxAmount,
                  tx.type === "deposit"
                    ? { color: COLORS.success }
                    : { color: COLORS.error },
                ]}
              >
                {tx.type === "deposit" ? "+" : "-"}
                {formatCentsToEuros(tx.amount)} €
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Retiradas recientes */}
      {walletPayouts.length > 0 && (
        <View style={styles.walletSectionCard}>
          <Text style={styles.walletSectionTitle}>Retiradas recientes</Text>
          {walletPayouts.slice(0, 5).map((payout) => (
            <View key={payout.id} style={styles.walletTxRow}>
              <View style={styles.walletTxIcon}>
                <ArrowUpFromLine
                  size={16}
                  color={COLORS.gray500}
                  strokeWidth={2.5}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.walletTxDesc}>Retirada a Stripe</Text>
                <Text style={styles.walletTxDate}>
                  {new Date(payout.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.walletTxAmount}>
                  -{formatCentsToEuros(payout.amount)} €
                </Text>
                <Text
                  style={[
                    styles.walletPayoutStatus,
                    payout.status === "succeeded" && { color: COLORS.success },
                    payout.status === "pending" && { color: COLORS.warning },
                    payout.status === "failed" && { color: COLORS.error },
                  ]}
                >
                  {payout.status === "succeeded"
                    ? "Completada"
                    : payout.status === "pending"
                      ? "En proceso"
                      : payout.status === "failed"
                        ? "Fallida"
                        : payout.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: SPACING.xxl }} />

      {/* Modal de retirar saldo */}
      {showPayoutModal && (
        <View style={styles.payoutModalOverlay}>
          <View style={styles.payoutModalCard}>
            <Text style={styles.payoutModalTitle}>Retirar saldo</Text>
            <Text style={styles.payoutModalSubtitle}>
              Saldo disponible: {getWalletBalanceEuros()} €
            </Text>
            <View style={styles.payoutInputWrapper}>
              <TextInput
                style={styles.payoutInput}
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                placeholder="0,00"
                placeholderTextColor={COLORS.gray400}
                keyboardType="decimal-pad"
              />
              <Text style={styles.payoutInputSuffix}>€</Text>
            </View>
            <View style={styles.payoutModalActions}>
              <TouchableOpacity
                style={[
                  styles.payoutModalBtn,
                  { backgroundColor: COLORS.gray200 },
                ]}
                onPress={() => {
                  setShowPayoutModal(false);
                  setPayoutAmount("");
                }}
                disabled={processingPayout}
              >
                <Text
                  style={[styles.payoutModalBtnText, { color: COLORS.gray700 }]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.payoutModalBtn,
                  { flex: 2, backgroundColor: COLORS.primary },
                ]}
                onPress={handleWithdraw}
                disabled={processingPayout}
              >
                {processingPayout ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.payoutModalBtnText}>Retirar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderSection = () => {
    switch (currentSubView) {
      case "menu":
        return renderMainMenu();
      case "mi-perfil":
        return renderProfileView();
      case "historial":
        return renderViajesSection();
      case "mis-vehiculos":
        return renderVehiculosSection();
      case "rutinas":
        return (
          <ScrollView
            style={styles.sectionContent}
            showsVerticalScrollIndicator={false}
          >
            {renderSubViewHeader("Mi rutina")}
            {renderPlaceholder(
              "Mis rutinas",
              "Crea rutinas para tus trayectos frecuentes y automatiza tus viajes.",
              Calendar,
            )}
          </ScrollView>
        );
      case "monedero":
        return renderMonederoSection();
      default:
        return renderMainMenu();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Contenido principal de la vista de perfil (Menú base o subvistas) */}
      <View style={styles.contentContainer}>{renderSection()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // SubView Header
  subViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.gray50,
  },
  subViewHeaderTitle: {
    fontSize: FONTS.lg,
    fontWeight: "700",
    color: COLORS.gray800,
  },

  // Content
  contentContainer: {
    flex: 1,
  },
  sectionContent: {
    flex: 1,
  },
  sectionScroll: {
    padding: SPACING.lg,
  },

  // Menú Principal Scroll
  menuScroll: {
    padding: SPACING.lg,
  },

  // Cabecera Integrada de Perfil
  profileHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  headerAvatarContainer: {
    marginRight: SPACING.md,
  },
  headerAvatarRing: {
    width: 68,
    height: 64,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: COLORS.primary, // Simula el anillo de progreso circular de la foto
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMain: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  avatarMainImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  avatarTextMain: {
    fontSize: FONTS.xxl,
    fontWeight: "bold",
    color: COLORS.gray800,
  },
  headerTextInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileMainName: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.gray800,
    marginBottom: 4,
  },
  profileCompletionHint: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    fontWeight: "500",
  },

  // Tarjeta verde de Ahorro generado
  savingsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E6F7F0", // Color verde menta suave de la imagen
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  savingsLeft: {
    flex: 1,
  },
  savingsIconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  savingsLabel: {
    fontSize: FONTS.md,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  infoCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.gray600,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCircleText: {
    fontSize: 9,
    fontWeight: "bold",
    color: COLORS.gray600,
  },
  savingsDate: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    fontWeight: "500",
  },
  savingsValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#10B981", // Verde oscuro resaltado
  },

  // Estadísticas en 3 Columnas
  statsCardBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  statsCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsDividerLine: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray100,
  },
  statsValueNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gray800,
    marginBottom: 4,
  },
  statsColLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    textAlign: "center",
    lineHeight: 14,
  },

  // Menú de opciones de lista vertical
  menuItemsBlock: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  menuRowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  menuRowText: {
    fontSize: FONTS.md,
    fontWeight: "500",
    color: COLORS.gray800,
  },
  menuSectionDivider: {
    height: 8,
    backgroundColor: COLORS.gray50,
    marginHorizontal: -SPACING.sm, // Expande el divisor gris por toda la card
  },

  // Botón de Cerrar Sesión del Menú
  menuLogoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.errorSoft,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  menuLogoutText: {
    fontSize: FONTS.md,
    color: COLORS.error,
    fontWeight: "600",
  },

  // Edit form / Datos personales
  editAvatarSection: {
    alignItems: "center",
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  editAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  editAvatarText: {
    fontSize: FONTS.xxxl,
    fontWeight: "bold",
    color: COLORS.white,
  },
  editAvatarHint: {
    fontSize: FONTS.xs,
    color: COLORS.gray400,
  },
  editAvatarWithCamera: {
    position: "relative",
    marginBottom: SPACING.xs,
  },
  editAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editAvatarCameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  editAvatarSubHint: {
    fontSize: FONTS.xs,
    color: COLORS.gray400,
    marginTop: 4,
  },
  editFormCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.small,
    marginBottom: SPACING.xl,
  },
  editField: {
    marginBottom: SPACING.lg,
    position: "relative",
  },
  editFieldLabel: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  editInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray50,
  },
  editInput: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.gray800,
    paddingVertical: 0,
  },
  saveProfileBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  editButtonRow: {
    flexDirection: "row",
    gap: SPACING.md,
    width: "100%",
  },
  saveProfileBtnText: {
    fontSize: FONTS.md,
    fontWeight: "700",
    color: COLORS.white,
  },

  // Nuevos estilos para secciones de Mi Perfil
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  sectionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: FONTS.lg,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  editHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondarySoft,
  },
  sectionEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.secondarySoft,
  },
  sectionEditBtnText: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.secondary,
  },
  viewField: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  viewFieldLabel: {
    fontSize: FONTS.xs,
    fontWeight: "600",
    color: COLORS.gray400,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  viewFieldValue: {
    fontSize: FONTS.md,
    color: COLORS.gray800,
    fontWeight: "500",
  },
  viewAboutMe: {
    fontSize: FONTS.md,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  datePickerButton: {
    width: "100%",
  },
  editInputPlaceholder: {
    color: COLORS.gray400,
  },
  genderPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.full,
  },
  genderOptionSelected: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  genderRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.gray300,
  },
  genderRadioSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  genderOptionText: {
    fontSize: FONTS.md,
    color: COLORS.gray700,
    fontWeight: "500",
  },
  genderOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Valoraciones
  ratingsCard: {
    padding: SPACING.md,
  },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  ratingMain: {
    flex: 1,
    alignItems: "flex-start",
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.gray800,
    lineHeight: 44,
  },
  ratingStars: {
    flexDirection: "row",
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  ratingCount: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
  },
  ratingAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
  },
  ratingActionText: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
  ratingDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: SPACING.md,
  },
  ratingInfo: {
    gap: SPACING.xs,
  },
  ratingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  ratingInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingInfoText: {
    flex: 1,
    fontSize: FONTS.md,
    color: COLORS.gray700,
    fontWeight: "500",
  },

  // Sobre mí
  aboutMeInput: {
    minHeight: 100,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  aboutMeHint: {
    fontSize: FONTS.xs,
    color: COLORS.gray400,
    textAlign: "right",
    marginTop: SPACING.xs,
  },

  // Estilos de Viajes Section (Historial de trayectos)
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONTS.md,
    color: COLORS.gray600,
    marginTop: SPACING.md,
    fontWeight: "500",
  },
  errorText: {
    fontSize: FONTS.md,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: FONTS.sm,
  },
  viajesScrollContent: {
    paddingBottom: SPACING.xxl,
  },
  fechaGrupoContainer: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  fechaGrupoTitulo: {
    fontSize: FONTS.md,
    fontWeight: "bold",
    color: COLORS.gray700,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  viajeCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  viajeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  badgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  rolBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  conductorBadge: {
    backgroundColor: COLORS.primarySoft,
  },
  pasajeroBadge: {
    backgroundColor: COLORS.secondarySoft,
  },
  rolBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: "700",
  },
  conductorBadgeText: {
    color: COLORS.primary,
  },
  pasajeroBadgeText: {
    color: COLORS.secondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  pendingStatusBadge: {
    backgroundColor: COLORS.warningSoft,
  },
  activeStatusBadge: {
    backgroundColor: COLORS.successSoft,
  },
  successStatusBadge: {
    backgroundColor: COLORS.gray100,
  },
  statusBadgeText: {
    fontSize: FONTS.xs,
    fontWeight: "600",
  },
  pendingStatusBadgeText: {
    color: COLORS.warning,
  },
  activeStatusBadgeText: {
    color: COLORS.success,
  },
  successStatusBadgeText: {
    color: COLORS.gray600,
  },
  viajePrice: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray900,
  },
  viajeCardRoute: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  routeTimeline: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.gray200,
    marginVertical: 4,
  },
  routePlaces: {
    flex: 1,
    gap: SPACING.lg,
  },
  routePlaceText: {
    fontSize: FONTS.sm,
    color: COLORS.gray800,
    fontWeight: "500",
  },
  viajeCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: SPACING.md,
  },
  footerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
  },
  footerInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerInfoText: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    fontWeight: "500",
  },

  // Estilos de Coches (Vehículos)
  addCocheMainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  addCocheMainBtnText: {
    color: COLORS.white,
    fontSize: FONTS.md,
    fontWeight: "700",
  },
  cochesListContainer: {
    gap: SPACING.lg,
  },
  cocheItemCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  cocheCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  cocheCardInfoMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  cocheCardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  cocheCardBrandModel: {
    fontSize: FONTS.lg,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  cocheCardColorYear: {
    fontSize: FONTS.xs,
    color: COLORS.gray400,
    fontWeight: "500",
    marginTop: 2,
  },
  cocheCardActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  cocheActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  cocheActionBtnDelete: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  cocheSpecsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: SPACING.md,
  },
  cocheSpecBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  cocheSpecText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: "500",
  },
  combustibleIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Placa de Matrícula Realista
  matriculaPlacaOuter: {
    alignItems: "center",
    marginVertical: SPACING.xs,
  },
  matriculaPlacaInner: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: "#333333",
    borderRadius: 4,
    height: 44,
    width: "100%",
    maxWidth: 240,
    overflow: "hidden",
  },
  placaBandaUE: {
    backgroundColor: "#003399", // Azul europeo oficial
    width: 28,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  placaStars: {
    color: "#FFCC00", // Amarillo de las estrellas europeas
    fontSize: 8,
    lineHeight: 8,
    textAlign: "center",
  },
  placaPais: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
  },
  placaDigitosContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  placaDigitosText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111111",
    letterSpacing: 2,
  },

  // Chips para Formulario de Coches
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  chipBtn: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
  },
  chipBtnSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipBtnText: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: "600",
  },
  chipBtnTextSelected: {
    color: COLORS.white,
  },
  colorChipBtn: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  colorChipBtnSelected: {
    backgroundColor: COLORS.gray800,
    borderColor: COLORS.gray800,
  },
  colorChipText: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: "500",
  },
  colorChipTextSelected: {
    color: COLORS.white,
  },

  // Autocompletado de Marcas y Modelos
  suggestionsContainer: {
    position: "absolute",
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    maxHeight: 180,
    overflow: "scroll",
    ...SHADOWS.medium,
    zIndex: 9999,
  },
  suggestionItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  suggestionText: {
    fontSize: FONTS.md,
    color: COLORS.gray700,
  },

  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  placeholderIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  placeholderTitle: {
    fontSize: FONTS.xl,
    fontWeight: "bold",
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  placeholderSubtitle: {
    fontSize: FONTS.md,
    color: COLORS.gray400,
    textAlign: "center",
    maxWidth: 280,
  },

  // ===== Monedero / Wallet =====
  walletBalanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  walletBalanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  walletIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  walletBalanceLabel: {
    fontSize: FONTS.md,
    fontWeight: "600",
    color: COLORS.white,
  },
  walletBalanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 4,
  },
  walletBalanceHint: {
    fontSize: FONTS.xs,
    color: "rgba(255,255,255,0.7)",
  },
  walletActionsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  walletActionBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: "center",
    ...SHADOWS.sm,
  },
  walletActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  walletActionText: {
    fontSize: FONTS.xs,
    fontWeight: "600",
    color: COLORS.gray700,
    textAlign: "center",
  },
  stripeConnectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  stripeConnectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  stripeConnectIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  stripeConnectTitle: {
    fontSize: FONTS.sm,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  stripeConnectSubtitle: {
    fontSize: FONTS.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  walletSectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  walletSectionTitle: {
    fontSize: FONTS.md,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: SPACING.sm,
  },
  walletErrorText: {
    fontSize: FONTS.sm,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  walletRetryBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIUS.full,
  },
  walletRetryBtnText: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.primary,
  },
  walletEmptyText: {
    fontSize: FONTS.sm,
    color: COLORS.gray400,
    paddingVertical: SPACING.md,
    textAlign: "center",
  },
  walletTxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray50,
  },
  walletTxIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray50,
    alignItems: "center",
    justifyContent: "center",
  },
  walletTxDesc: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.gray800,
  },
  walletTxDate: {
    fontSize: FONTS.xs,
    color: COLORS.gray400,
    marginTop: 2,
  },
  walletTxAmount: {
    fontSize: FONTS.sm,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  walletPayoutStatus: {
    fontSize: FONTS.xs,
    fontWeight: "500",
    marginTop: 2,
  },
  payoutModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  payoutModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: "85%",
    ...SHADOWS.lg,
  },
  payoutModalTitle: {
    fontSize: FONTS.lg,
    fontWeight: "bold",
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
  },
  payoutModalSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.lg,
  },
  payoutInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  payoutInput: {
    flex: 1,
    fontSize: FONTS.xl,
    fontWeight: "600",
    color: COLORS.gray800,
    paddingVertical: SPACING.md,
  },
  payoutInputSuffix: {
    fontSize: FONTS.xl,
    fontWeight: "600",
    color: COLORS.gray400,
  },
  payoutModalActions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  payoutModalBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  payoutModalBtnText: {
    fontSize: FONTS.sm,
    fontWeight: "700",
    color: COLORS.white,
  },

  // ===== Cuentas vinculadas (tarjetas y bancos) =====
  linkedAccountsTitle: {
    fontSize: FONTS.lg,
    fontWeight: "700",
    color: COLORS.gray800,
    marginBottom: SPACING.md,
  },
  linkedAccountsList: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  bankCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    minHeight: 180,
    justifyContent: "space-between",
    ...SHADOWS.md,
    overflow: "hidden",
  },
  bankCardVisa: {
    backgroundColor: "#1A1F71",
  },
  bankCardMastercard: {
    backgroundColor: "#EB001B",
  },
  bankCardAmex: {
    backgroundColor: "#006FCF",
  },
  bankCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bankCardChip: {
    width: 40,
    height: 30,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  bankCardBrand: {
    fontSize: FONTS.md,
    fontWeight: "800",
    color: COLORS.white,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bankCardNumber: {
    fontSize: FONTS.lg,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  bankCardBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  bankCardLabel: {
    fontSize: FONTS.xs,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bankCardValue: {
    fontSize: FONTS.sm,
    fontWeight: "600",
    color: COLORS.white,
    marginTop: 2,
  },
  bankCardBrandCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bankCardBrandCircleText: {
    fontSize: FONTS.md,
    fontWeight: "800",
    color: COLORS.white,
  },
  bankAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  bankAccountLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },
  bankAccountIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  bankAccountBank: {
    fontSize: FONTS.sm,
    fontWeight: "700",
    color: COLORS.gray800,
  },
  bankAccountIban: {
    fontSize: FONTS.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  bankAccountRight: {
    alignItems: "flex-end",
  },
  bankAccountStatus: {
    fontSize: FONTS.xs,
    fontWeight: "600",
  },
  bankAccountCurrency: {
    fontSize: FONTS.xs,
    color: COLORS.gray400,
    marginTop: 2,
    textTransform: "uppercase",
  },
});

export default ProfileView;
