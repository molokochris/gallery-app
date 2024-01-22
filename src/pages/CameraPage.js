import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  BackHandler,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import * as Location from "expo-location";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as SQLite from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/themed";
import axios from "axios";
import { ActivityIndicator } from "react-native";

function CameraScreen() {
  // const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);
  const [location, setLocation] = useState();
  const [type, setType] = useState(CameraType.back);

  const navigation = useNavigation();
  let cameraRef = useRef("");

  // const navigator = useNavigation();

  // Connecting to the SQLite database or opening database
  const db = SQLite.openDatabase("photocollection.db");

  useEffect(() => {
    (async () => {
      hasMediaAccess();

      hasCameraAccess();
      // Request location permissions here:
      hasLocation();
      if (!hasCameraAccess || !hasMediaAccess || !hasLocation) {
        Alert.alert(
          "Some permission were not granted, so camera won't work properly."
        );
      }
    })();
    createImageTable();
  }, []);

  const hasMediaAccess = async () => {
    const { status: mediaLibraryPermission } =
      await MediaLibrary.requestPermissionsAsync();
    if (mediaLibraryPermission === "granted") {
      console.log("media Access: ", mediaLibraryPermission === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission === "granted");
      return true;
    }
    return false;
  };

  const hasCameraAccess = async () => {
    const { status: cameraPermission } =
      await Camera.requestCameraPermissionsAsync();

    if (cameraPermission === "granted") {
      console.log("camera status: ", cameraPermission === "granted");
      setHasCameraPermission(cameraPermission === "granted");
      return true;
    }
    return false;
  };

  const hasLocation = async () => {
    const { status: locationPermission } =
      await Location.requestForegroundPermissionsAsync();
    // Check if location permission is granted:
    if (locationPermission === "granted") {
      const userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation);
      console.log("userLocation: ", userLocation);
      return true;
    }
    return false;
  };

  // Handles creating the table in SQLite
  const createImageTable = () => {
    db.transaction((tx) => {
      tx.executeSql(
        // 'CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, image_data TEXT, image_url TEXT, )'
        "CREATE TABLE IF NOT EXISTS photocollection (id INTEGER PRIMARY KEY AUTOINCREMENT, image_url TEXT)"
      );
    });
  };

  // Handles the take photo function
  const takePic = async () => {
    if (!cameraRef.current) return;

    const options = {
      quality: 1,
      base64: true,
      exif: false,
    };

    setIsLoading(true);
    try {
      let newPhoto = await cameraRef.current.takePictureAsync(options);

      if (location) {
        console.log(
          "User Location:",
          location.coords.latitude,
          location.coords.longitude
        );
        // You can use location.coords.latitude and location.coords.longitude here.
      }
      newPhoto.location = location;
      // setPhoto(newPhoto);
      savePhoto(newPhoto);
      // console.log("image taken:", newPhoto.location);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  let imageUri = null;
  const savePhoto = async (photo) => {
    try {
      const imageUrl = `${photo.uri}`;

      if (photo.location) {
        const { latitude, longitude } = location.coords;

        console.log(
          "User Location:",
          // location.coords.latitude,
          latitude,
          longitude
          // location.coords.longitude
        );

        db.transaction((tx) => {
          tx.executeSql(
            "INSERT INTO photocollection (image_data, image_url, latitude, longitude) VALUES (?, ?, ?, ?)",
            [photo.base64, imageUrl, latitude, longitude],
            (_, results) => {
              if (results.rowsAffected > 0) {
                console.warn("Image saved successfully.");
              } else {
                console.warn("Image not saved.");
              }
            }
          );
        });
        // setImageUri(newPhoto);
        imageUri = imageUrl;
        console.log("image URI : ", imageUrl);
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (hasCameraPermission === null || hasMediaLibraryPermission === null) {
    return (
      <Text style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        Requesting permissions...
      </Text>
    );
  } else if (!hasCameraPermission) {
    return (
      <Text>
        Permission for camera not granted. Please change this in settings.
      </Text>
    );
  }

  const closeApp = () => {
    Alert.alert("Leaving? 😔", "Are you Sure You Want To Leave The App!!?", [
      {
        text: "Staying",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      { text: "Leaving", onPress: () => BackHandler.exitApp() },
    ]);
  };

  const flipCamera = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
    console.log("Camera Set", type);
  };

  return (
    <Camera style={styles.container} ref={cameraRef} type={type}>
      <View style={{ flex: 1 }}>
        {/* <View>

        </View> */}
        <StatusBar style="inverted" translucent={false} />
        <TouchableOpacity
          style={{
            backgroundColor: "rgba(51, 51, 51, 0.6)",
            marginTop: 5,
            marginLeft: 5,
            width: 45,
            height: 45,
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
            borderRadius: 100,
          }}
          onPress={closeApp}
        >
          <Icon name="close" color="whitesmoke" size={20} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-end",
            // backgroundColor: "red",
            // justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Pressable onPress={() => navigation.navigate("Gallery")}>
            <ImageBackground
              source={imageUri === null ? {} : { uri: imageUri }}
              style={{
                // backgroundColor: "grey",
                borderWidth: 1,
                borderColor: "whitesmoke",
                marginTop: 5,
                marginLeft: 15,
                width: 55,
                height: 55,
                justifyContent: "center",
                alignItems: "center",
                padding: 10,
                borderRadius: 100,
              }}
            ></ImageBackground>
          </Pressable>
          <TouchableOpacity
            style={{
              backgroundColor: "whitesmoke",
              marginTop: 5,
              marginLeft: "22%",
              width: 65,
              height: 65,
              // alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
              borderRadius: 100,
            }}
            disabled={isLoading == true}
            onPress={takePic}
          >
            {isLoading ? (
              <ActivityIndicator size={"small"} color={"black"} />
            ) : (
              <Icon name="camera" color="black" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              // backgroundColor: "whitesmoke",
              marginTop: 5,
              marginLeft: "22%",
              width: 65,
              height: 65,
              // alignSelf: "flex-start",
              justifyContent: "center",
              alignItems: "baseline",
              padding: 10,
              borderRadius: 100,
            }}
            onPress={flipCamera}
          >
            {/* <Text>Take</Text> */}
            <Icon
              type="material-community"
              name="camera-flip"
              color="whitesmoke"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Camera>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
  alertMessageContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
  },
  alertMessageText: {
    width: 10,
  },
  PressableContainer: {
    alignSelf: "center",
  },
  Pressable: {
    margin: 40,
  },
  previewContainer: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    marginVertical: "50%",
  },
  preview: {
    marginHorizontal: "25%",
    width: 200,
    height: 200,
  },
  imageContainer: {
    marginBottom: 30,
  },
  optionsBtnContainer: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
  },
  optionsBtn: {
    width: 150,
    margin: 5,
  },
});

export default CameraScreen;
