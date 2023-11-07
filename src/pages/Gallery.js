import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import ViewImage from "../components/ViewImage";

export default function Gallery() {
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <ViewImage />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    Flex: 1,
  },
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "ceneter",
  },
});
