import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Image,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import * as SQLite from "expo-sqlite";
// import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Icon } from "@rneui/base";

function ViewImage() {
  const [imagesCollection, setImagesCollection] = useState([]); // For storing the databse info
  const [selectedImage, setSelectedImage] = useState(null); // For displaying the selected image
  const [selectedImageInfo, setSelectedImageInfo] = useState(null); // For displaying image info
  const [modalVisible, setModalVisible] = useState(false); // For modal functionality

  // Connecting to the database
  const db = SQLite.openDatabase("photocollection.db");

  useEffect(() => {
    getData();
  }, [imagesCollection]);

  // Reading data from the SQLite database
  const getData = async () => {
    try {
      db.transaction((tx) => {
        tx.executeSql("SELECT * FROM photocollection", [], (_, results) => {
          const images = results.rows._array;
          setImagesCollection(images);
          //   console.log("Image info", images);
        });
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Deleting data from the SQLite database
  const deleteSelectedImages = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM photocollection WHERE id = ?",
        [id],
        (_, result) => {
          if (result.rowsAffected > 0) {
            console.warn("Image deleted"); // Logs a massege if the image was deleted
          } else {
            console.log("Didn't Delete");
          }
          // console.warn('Image deleted'); // Logs a massege if the image was deleted
          // getData(); // Refresh the data after deleting
          setModalVisible(false);
        }
      );
    });
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setSelectedImageInfo();
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };

  const openImageInfo = (id) => {
    setSelectedImageInfo(id);
  };

  const closeImageInfo = () => {
    setSelectedImageInfo(null);
  };

  return (
    <View style={styles.container}>
      {imagesCollection.length === 0 ? (
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>No Snaps Found!</Text>
        </View>
      ) : (
        <ScrollView>
          {imagesCollection.map((item, index) => (
            <View
              key={index}
              style={{ justifyContent: "center", alignContent: "center" }}
            >
              <TouchableOpacity
                onPress={() => openImageModal(item.image_url)} // Open image when clicked
              >
                <Image source={{ uri: item.image_url }} style={styles.image} />
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-around",
                  marginTop: -5,
                }}
              >
                <TouchableOpacity onPress={() => deleteSelectedImages(item.id)}>
                  <Icon
                    name="delete"
                    // style={styles.iconDelete}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openImageInfo(item.id)}>
                  <Icon
                    name="info"
                    // style={styles.iconInfo}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeImageModal}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 80,
            }}
          >
            <TouchableOpacity onPress={closeImageModal}>
              <Icon
                name="close"
                style={styles.iconClose}
                //   size="30"
              />
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: selectedImage }}
            style={{ flex: 1, marginBottom: 70 }}
            resizeMode="contain"
          />
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={false}
        visible={!!selectedImageInfo}
        onRequestClose={closeImageInfo}
      >
        <View style={{ flex: 1 }}>
          {selectedImageInfo && (
            <View style={{ padding: 20 }}>
              <Text>Name: {selectedImageInfo.name}</Text>
              <Text>Description: {selectedImageInfo.description}</Text>
              <Text>Date: {selectedImageInfo.date}</Text>
            </View>
          )}
          <TouchableOpacity onPress={closeImageInfo}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: 350,
    height: 340,
    margin: 10,
  },
  selectButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "blue",
    borderRadius: 5,
    marginLeft: 10,
  },
  selectedButton: {
    backgroundColor: "blue",
  },
  iconClose: {
    fontSize: 30,
  },
  iconInfo: {
    fontSize: 30,
  },
  iconDelete: {
    color: "red",
    fontSize: 30,
  },
});

export default ViewImage;
