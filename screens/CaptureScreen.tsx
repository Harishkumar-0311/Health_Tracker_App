import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../types/navigation';
import { supabase } from '../lib/supabase';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#059669' },
  cameraContainer: { flex: 1, backgroundColor: '#059669' },
  permissionBtn: { backgroundColor: '#047857', padding: 14, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  closeBtn: { position: 'absolute', top: 40, left: 20, backgroundColor: '#047857cc', borderRadius: 24, padding: 8, zIndex: 10 },
  captureBtnContainer: { position: 'absolute', bottom: 40, alignSelf: 'center', zIndex: 10 },
  captureBtn: { backgroundColor: '#fff', borderRadius: 40, width: 70, height: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#047857' },
  popupOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#059669cc', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  popupBox: { backgroundColor: '#047857', borderRadius: 16, padding: 24, alignItems: 'center', width: 300 },
  popupCloseBtn: { position: 'absolute', top: 10, right: 10 },
  popupTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#fff' },
  popupText: { fontSize: 16, marginTop: 8, color: '#fff' },
});

export default function CaptureScreen() {
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const cameraRef = useRef<Camera | null>(null);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleCaptureAndUpload = async () => {
    try {
      let userInfoPrompt = '';
      const userProfileString = await AsyncStorage.getItem('userProfile');

      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);
        const { data: userData, error } = await supabase
          .from('DatasUser')
          .select('*')
          .eq('id', userProfile.id)
          .single();

        if (error) {
          console.error('Supabase error:', error.message);
          Alert.alert('Supabase Error', error.message);
        }

        if (userData) {
          userInfoPrompt = `User Info: Name: ${userData.name}, Email: ${userData.email}`;
          if (userData.age) userInfoPrompt += `, Age: ${userData.age}`;
          if (userData.bp) userInfoPrompt += `, BP: ${userData.bp}`;
          if (userData.sugar) userInfoPrompt += `, Sugar: ${userData.sugar}`;
          if (userData.hba1c) userInfoPrompt += `, HbA1c: ${userData.hba1c}`;
          if (userData.glycemicIndex) userInfoPrompt += `, Glycemic Index: ${userData.glycemicIndex}`;
          if (userData.cholesterol) userInfoPrompt += `, Cholesterol: ${userData.cholesterol}`;
        } else {
          userInfoPrompt = `User Info: Name: ${userProfile.name}, Email: ${userProfile.email}`;
        }
      }

      let base64Image = '';

      if (cameraRef.current) {
        setLoading(true);
        const photo = await cameraRef.current.takePictureAsync({ base64: true });
        base64Image = photo.base64 || '';
      } else {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          base64: true,
          quality: 1,
        });
        if (!result.canceled && result.assets && result.assets[0].base64) {
          base64Image = result.assets[0].base64;
        }
      }

      if (!base64Image) {
        Alert.alert('Error', 'No image captured.');
        setLoading(false);
        return;
      }

      setShowPopup(true);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer `,
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-small-3.2-24b-instruct:free',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: `${userInfoPrompt}\nIs this suitable for the consumer? Green tick icon if ok, red cross icon if not(at the top).Give summary in 50 words. ` },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${base64Image}` },
                },
              ],
            },
          ],
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert('API Error', errorText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const summary = data?.choices?.[0]?.message?.content || 'No summary.';
      setApiResult(summary);
      setShowPopup(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2186eb" />
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Camera permission denied.</Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={{ color: '#fff' }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      {hasPermission && showCamera && typeof Camera === 'function' && (
        <Camera
          style={StyleSheet.absoluteFill}
          ref={cameraRef}
          type={cameraType}
          ratio="16:9"
        />
      )}

      {hasPermission && showCamera && typeof Camera !== 'function' && (
        <View style={styles.container}>
          <Text>Click to capture to make suggestions of Your Product.</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={handleCaptureAndUpload}>
            <Text style={{ color: '#fff' }}>Pick or Capture</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#0008', borderRadius: 24, padding: 8 }}
        onPress={() => setCameraType(prev => (prev === 'back' ? 'front' : 'back'))}
      >
        <Ionicons name="camera-reverse" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="close" size={32} color="#fff" />
      </TouchableOpacity>

      <View style={styles.captureBtnContainer}>
        <TouchableOpacity
          style={styles.captureBtn}
          onPress={handleCaptureAndUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <Ionicons name="camera" size={38} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Popup overlay for loading and result */}
      {showPopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color="#2186eb" style={{ marginBottom: 18 }} />
                <Text style={styles.popupTitle}>Analyzing...</Text>
                <Text style={styles.popupText}>Please wait while we analyze your image.</Text>
              </>
            ) : (
              <>
                <Text style={styles.popupTitle}>Health Expert</Text>
                <Text style={styles.popupText}>{apiResult}</Text>
                <TouchableOpacity
                  style={[styles.permissionBtn, { marginTop: 18, width: 120, alignSelf: 'center' }]}
                  onPress={() => {
                    setShowPopup(false);
                    navigation.navigate('Home');
                  }}
                  accessibilityLabel="Done"
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
