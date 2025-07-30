import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

type User = {
  id: string;
  name: string;
  email: string;
};

type UserInsert = Omit<User, 'id'>; // for inserting new users

import { Modal, ScrollView } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  // Additional profile fields
  const [modalName, setModalName] = useState(name); // For modal name input
  const [age, setAge] = useState('');
  const [bp, setBp] = useState('');
  const [sugar, setSugar] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [glycemicIndex, setGlycemicIndex] = useState('');
  const [cholesterol, setCholesterol] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    (async () => {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        navigation.replace('Main');
      }
    })();
  }, []);

  const handleLogin = async () => {
    if (!name || !email) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    // Only authenticate: check for existing user
    const { data: existingUsers, error: fetchError } = await supabase
      .from('DatasUser')
      .select('*')
      .ilike('email', email);
    setLoading(false);
    if (fetchError) {
      Alert.alert('Error', fetchError.message);
      return;
    }
    if (existingUsers && existingUsers.length > 0) {
      // Optionally check name match, or just email
      await AsyncStorage.setItem('userProfile', JSON.stringify(existingUsers[0]));
      navigation.replace('Main');
      return;
    } else {
      Alert.alert('No account found', 'Please use "Create New Account" to register.');
    }
  };

  // Save additional details to Supabase
  const handleSaveDetails = async () => {
    if (!userId) return;
    setLoading(true);
    const { error } = await supabase
      .from('DatasUser')
      .update({ name: modalName, age, bp, sugar, hba1c, glycemicIndex, cholesterol })
      .eq('id', userId);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    setShowDetailsModal(false);
    navigation.replace('Main');
  };


  return (
    <LinearGradient colors={['#ff9800', '#ffb347']} style={styles.container}>
      <Text style={styles.title}>Welcome! Create your profile</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} autoCapitalize="words" />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      {loading ? (
        <ActivityIndicator size="large" color="#e53935" />
      ) : (
        <Button title="Continue" onPress={handleLogin} />
      )}
      <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
        <Text style={{ color: '#1976d2', textAlign: 'center', marginTop: 16, textDecorationLine: 'underline', fontWeight: 'bold' }}>
          Create New Account
        </Text>
        <Text style={{ color: '#888', textAlign: 'center', marginTop: 4, fontSize: 12 }}>
          Not registered? Tap here to create your profile.
        </Text>
      </TouchableOpacity>
      {/* Profile Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#059669', borderRadius: 16, padding: 24, width: '90%' }}>
            <Text style={{ fontSize: 20, marginBottom: 16, color: '#d1fae5', textAlign: 'center' }}>Complete Your Profile</Text>
            <View>
              <TextInput placeholder="Name" value={modalName} onChangeText={setModalName} style={styles.input} autoCapitalize="words" />
              <TextInput placeholder="Age" value={age} onChangeText={setAge} style={styles.input} keyboardType="numeric" />
              <TextInput placeholder="BP (e.g. 120/80)" value={bp} onChangeText={setBp} style={styles.input} />
              <TextInput placeholder="Sugar (mg/dL)" value={sugar} onChangeText={setSugar} style={styles.input} />
              <TextInput placeholder="HbA1c (%)" value={hba1c} onChangeText={setHba1c} style={styles.input} />
              <TextInput placeholder="Glycemic Index" value={glycemicIndex} onChangeText={setGlycemicIndex} style={styles.input} />
              <TextInput placeholder="Cholesterol (mg/dL)" value={cholesterol} onChangeText={setCholesterol} style={styles.input} />
              {loading ? (
                <ActivityIndicator size="large" color="#e53935" />
              ) : (
                <Button title="Save Details" onPress={handleSaveDetails} color="#ff9800" />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    // backgroundColor removed to allow gradient
  },
  title: { fontSize: 22, marginBottom: 24, textAlign: 'center', color: '#d1fae5' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 16, padding: 12, fontSize: 16 },
});
