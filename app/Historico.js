import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, Share, Animated } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function Historico() {
  const router = useRouter();
  const [qrListArray, setQrListArray] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    loadQrHistory();
  }, []);

  const loadQrHistory = async () => {
    const storedQrList = await AsyncStorage.getItem("qrList");
    if (storedQrList) {
      setQrListArray(JSON.parse(storedQrList));
    } else {
      setQrListArray([]);
    }
  };

  const limparHistorico = async () => {
    await AsyncStorage.removeItem("qrList");
    setQrListArray([]);
    Alert.alert("Histórico Apagado", "Seu histórico foi excluído permanentemente.");
  };

  const toggleDarkMode = () => {
    Animated.timing(animatedValue, {
      toValue: darkMode ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setDarkMode(!darkMode);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onLongPress={() => Share.share({ message: item.url })}
      onPress={() => Linking.openURL(item.url)}
    >
      <Text style={styles.listText}>{item.url}</Text>
      <Text style={styles.timestamp}>Escaneado em: {item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <Animated.View style={[styles.historyContainer, darkMode && styles.darkMode]}>
      <Text style={[styles.historyTitle, darkMode && styles.darkModeText]}>Histórico de QR Codes</Text>

      <FlatList
        data={qrListArray}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={[styles.listText, darkMode && styles.darkModeText]}>Nenhum QR Code escaneado ainda.</Text>}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={limparHistorico}>
          <MaterialIcons name="delete" size={24} color="white" />
          <Text style={styles.text}>Limpar Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleDarkMode}>
          <MaterialIcons name={darkMode ? "light-mode" : "dark-mode"} size={24} color="white" />
          <Text style={styles.text}>Modo {darkMode ? "Claro" : "Escuro"}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Container principal
  historyContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  darkMode: {
    backgroundColor: "#1a1a1a",
  },
  darkModeText: {
    color: "#fff",
  },
  // Título do histórico
  historyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  // Itens da lista de histórico
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listText: {
    fontSize: 16,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  // Container dos botões
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  // Botões de ação
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
});
