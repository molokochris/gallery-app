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
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as SQLite from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/themed";
import axios from "axios";

function CameraScreen() {
  const [photo, setPhoto] = useState([]);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);
  const [location, setLocation] = useState();

  let cameraRef = useRef("");

  const navigator = useNavigation();

  // Connecting to the SQLite database or opening database
  const db = SQLite.openDatabase("photocollection.db");

  useEffect(() => {
    (async () => {
      const { status: cameraPermission } =
        await Camera.requestCameraPermissionsAsync();
      const { status: mediaLibraryPermission } =
        await MediaLibrary.requestPermissionsAsync();

      // Request location permissions here:
      const { status: locationPermission } =
        await Location.requestForegroundPermissionsAsync();

      setHasCameraPermission(cameraPermission === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission === "granted");

      // Check if location permission is granted:
      if (locationPermission === "granted") {
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation(userLocation);
      }
    })();

    createImageTable();
    setPhoto("");
  }, []);

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

      setPhoto(newPhoto);
    } catch (err) {
      console.log(err);
    }
  };

  const closeCamera = () => {
    navigator.navigate("Welcome");
  };

  if (photo) {
    const sharePic = () => {
      Sharing(photo.uri).then(() => {
        setPhoto("");
      });
    };

    const savePhoto = async () => {
      try {
        const imageUrl = `${photo.uri}`;

        if (location) {
          const { latitude, longitude } = location.coords;

          console.log(
            "User Location:",
            location.coords.latitude,
            location.coords.longitude
          );

          db.transaction((tx) => {
            tx.executeSql(
              // 'INSERT INTO images (image_data, image_url) VALUES (?, ?)',
              "INSERT INTO photocollection (image_url) VALUES (?)",

              // [photo.base64, imageUrl, latitude, longitude],
              [imageUrl],
              (_, results) => {
                if (results.rowsAffected > 0) {
                  console.warn("Image saved successfully.");
                } else {
                  console.warn("Image not saved.");
                }
              }
            );
          });
          setPhoto("");
        }
      } catch (err) {
        console.log(err);
      }
    };

    return (
      <SafeAreaView>
        <View style={styles.previewContainer}>
          <View style={styles.imageContainer}>
            <Image style={styles.preview} source={photo} />
          </View>
          <View style={styles.optionsBtnContainer}>
            <Pressable
              title="Share"
              style={styles.optionsBtn}
              onPress={sharePic}
            >
              <Text>Share</Text>
            </Pressable>
            <Pressable
              title="Save"
              style={styles.optionsBtn}
              onPress={savePhoto}
            >
              <Text>Save</Text>
            </Pressable>
            <Pressable
              title="Discard"
              style={styles.optionsBtn}
              onPress={() => setPhoto("")}
            >
              <Text>Discard</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (hasCameraPermission === null || hasMediaLibraryPermission === null) {
    return <Text>Requesting permissions...</Text>;
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
        text: "Stay",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
      { text: "Yes", onPress: () => BackHandler.exitApp() },
    ]);
  };

  return (
    <Camera style={styles.container} ref={cameraRef}>
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
            // justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <ImageBackground
            source={{}}
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
          >
            {/* <Text>Gallery</Text> */}
          </ImageBackground>
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
          >
            {/* <Text>Take</Text> */}
            <Icon name="camera" color="black" />
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
