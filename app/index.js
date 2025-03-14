import React, { useState, useEffect } from "react";
import { View, Text, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function Index() {
  const router = useRouter();
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrList, setQrList] = useState([]);
  const [scannerAtivo, setScannerAtivo] = useState(false);

  useEffect(() => {
    loadQrHistory();
  }, []);

  const loadQrHistory = async () => {
    const storedQrList = await AsyncStorage.getItem("qrList");
    setQrList(storedQrList ? JSON.parse(storedQrList) : []);
  };

  const saveQrHistory = async (newQrList) => {
    await AsyncStorage.setItem("qrList", JSON.stringify(newQrList));
  };

  const handleCamera = async ({ data }) => {
    setScanned(true);
    setScannerAtivo(false); // Desativa scanner após leitura

    const qrItem = { url: data, timestamp: new Date().toLocaleString() };
    const updatedQrList = [...qrList, qrItem];

    setQrList(updatedQrList);
    await saveQrHistory(updatedQrList);

    Alert.alert("QR Code Escaneado!", `Conteúdo: ${data}`, [{ text: "OK" }]);
  };

  const ativarScanner = () => {
    setScannerAtivo(true);
    setScanned(false); // Permite novas leituras
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Permita que o app utilize a câmera.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scannerAtivo ? (
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleCamera}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Scanner desativado</Text>
        </View>
      )}

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.button} onPress={ativarScanner}>
          <MaterialIcons name="camera-alt" size={24} color="white" />
          <Text style={styles.text}>Ativar Scanner</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/Historico")}>
          <MaterialIcons name="history" size={24} color="white" />
          <Text style={styles.text}>Ver Histórico</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>Total de QR Codes: {qrList.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
    color: "white",
    fontSize: 16,
  },
  camera: {
    flex: 8,
    width: "100%",
    borderRadius: 15,
    overflow: "hidden",
  },
  placeholder: {
    flex: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 15,
  },
  placeholderText: {
    color: "#888",
    fontSize: 18,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingVertical: 15,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  counterContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
  },
  counterText: {
    fontSize: 16,
    color: "#ddd",
  },
});
