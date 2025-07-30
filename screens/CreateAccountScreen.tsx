import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateAccountScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  // Profile fields
  const [age, setAge] = useState('');
  const [bp, setBp] = useState('');
  const [sugar, setSugar] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [glycemicIndex, setGlycemicIndex] = useState('');
  const [cholesterol, setCholesterol] = useState('');

  // Step 1: Enter name/email, Step 2: Confirm, Step 3: Profile details

  const handleCheckAndCreate = async () => {
    if (!name || !email) {
      Alert.alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    // Check if user already exists
    const { data: existing, error } = await supabase
      .from('DatasUser')
      .select('*')
      .ilike('email', email);
    if (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
      return;
    }
    if (existing && existing.length > 0) {
      setLoading(false);
      Alert.alert('Account already exists!', 'Redirecting to Home...');
      await AsyncStorage.setItem('userProfile', JSON.stringify(existing[0]));
      navigation.replace('Main');
      return;
    }
    // If not registered, create user immediately with all details
    const { data, error: insertError } = await supabase
      .from('DatasUser')
      .insert([{ name, email, age, bp, sugar, hba1c, glycemicIndex, cholesterol }])
      .select();
    setLoading(false);
    if (insertError || !data || data.length === 0) {
      Alert.alert('Error', insertError?.message || 'Failed to create user');
      return;
    }
    await AsyncStorage.setItem('userProfile', JSON.stringify(data[0]));
    navigation.replace('Main');
  };


  const handleCreateUser = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('DatasUser')
      .insert([{ name, email }])
      .select();
    setLoading(false);
    if (error || !data || data.length === 0) {
      Alert.alert('Error', error?.message || 'Failed to create user');
      return;
    }
    setUserId(data[0].id);
    await AsyncStorage.setItem('userProfile', JSON.stringify(data[0]));
    setStep(3);
  };

  const handleSaveProfile = async () => {
    if (!userId) return;
    setLoading(true);
    const { error } = await supabase
      .from('DatasUser')
      .update({ name, age, bp, sugar, hba1c, glycemicIndex, cholesterol })
      .eq('id', userId);
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    navigation.replace('Main');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 && (
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} autoCapitalize="words" />
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
          {loading ? (
            <ActivityIndicator size="large" color="#e53935" />
          ) : (
            <Button title="Next" onPress={handleCheckAndCreate} />
          )}
        </View>
      )}
      {step === 2 && (
        <View style={styles.card}>
          <Text style={styles.title}>Confirm Details</Text>
          <Text style={{ marginBottom: 16 }}>Name: {name}</Text>
          <Text style={{ marginBottom: 16 }}>Email: {email}</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#e53935" />
          ) : (
            <Button title="Confirm & Create" onPress={handleCreateUser} />
          )}
        </View>
      )}
      {step === 3 && (
        <View style={styles.card}>
          <Text style={styles.title}>Complete Profile</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} autoCapitalize="words" />
          <TextInput placeholder="Age" value={age} onChangeText={setAge} style={styles.input} keyboardType="numeric" />
          <TextInput placeholder="BP (e.g. 120/80)" value={bp} onChangeText={setBp} style={styles.input} />
          <TextInput placeholder="Sugar (mg/dL)" value={sugar} onChangeText={setSugar} style={styles.input} />
          <TextInput placeholder="HbA1c (%)" value={hba1c} onChangeText={setHba1c} style={styles.input} />
          <TextInput placeholder="Glycemic Index" value={glycemicIndex} onChangeText={setGlycemicIndex} style={styles.input} />
          <TextInput placeholder="Cholesterol (mg/dL)" value={cholesterol} onChangeText={setCholesterol} style={styles.input} />
          {loading ? (
            <ActivityIndicator size="large" color="#e53935" />
          ) : (
            <Button title="Save Profile" onPress={handleSaveProfile} color="#ff9800" />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d1fae5',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#047857',
    color: '#fff',
  },
});
