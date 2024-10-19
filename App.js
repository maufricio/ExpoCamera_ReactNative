import { StatusBar } from 'expo-status-bar';
import { Alert, StyleSheet, Text, View, SafeAreaView, Button, Image, TouchableOpacity} from 'react-native';
import { Camera, CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import React, { useState, useEffect, useRef } from 'react';


export default function App() {
  const cameraRef = useRef()
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [facing, setFacing] = useState('back');

  const [photo, setPhoto] = useState();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync(); // this will ask the user for permission to access the camera
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync() // this will ask the user for permission to access the media library that means media library is the place where the photos and videos are stored
      setHasCameraPermission(cameraPermission.status === 'granted');
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
    })(); // the empty array means this will only run once when the component mounts this avoids infinite requesting of permissions to the user
  }, []);

  if(hasCameraPermission === undefined){
    return <Text>Requesting permissions...</Text>
  } else if(!hasCameraPermission) {
    return <Text>Permission for camera not granted. Please change this in settings</Text>
  }


  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif:false
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  }

  if(photo) {
    let sharePic = () => {
      Sharing.shareAsync(photo.uri).then( () => {
        setPhoto(undefined); //When the user shares the photo, the photo will be removed from the screen
      })
    };

    let savePhoto = () => {
        MediaLibrary.saveToLibraryAsync(photo.uri).then( () => {
          Alert.alert("Photo saved", "Your photo has been saved to your library");
          setPhoto(undefined); //When the user saves the photo, the photo will be removed from the screen
        });
    };

    return(
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source = {{ uri: "data:image/jpg;base64,"+ photo.base64 }} />
        <Button title="Share" onPress={sharePic} />
        {hasMediaLibraryPermission ? <Button title="Save" onPress={savePhoto} /> : undefined}
        <Button title="Don't like the photo" onPress={() => setPhoto(undefined)} />
      </SafeAreaView>
    );
  }

  return (
    <CameraView style={styles.container} facing={facing} ref={cameraRef}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
          <Button title="Take Picture" onPress={takePic} />
      </View>
    </CameraView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer :{
    backgroundColor: '#fff',
    alignSelf:'flex-end'
  },
  preview: {
    alignSelf : 'stretch',
    flex:1,
  }
});
