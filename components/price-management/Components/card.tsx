import React from "react";
import { StyleSheet, View } from "react-native";

export default function Card({
  children,
  style,
  small = false,
}: {
  children: React.ReactNode;
  style?: any;
  small?: boolean;
}) {
  return (
    <View
      style={[
        styles.card,
        small && styles.smallCard,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  smallCard: {
    flex: 1,
    alignItems: "center",
  },
});
