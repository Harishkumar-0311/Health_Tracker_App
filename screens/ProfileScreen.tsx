import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const userProfileString = await AsyncStorage.getItem('userProfile');
      if (!userProfileString) {
        setLoading(false);
        Alert.alert('Error', 'No user profile found');
        return;
      }
      const userProfile = JSON.parse(userProfileString);
      const { data, error } = await supabase
        .from('DatasUser')
        .select('*')
        .eq('id', userProfile.id)
        .single();
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    })();
  }, []);

  const startEdit = (field: string) => {
    setEditingField(field);
    setFieldValue(profile?.[field] || '');
  };
  const cancelEdit = () => {
    setEditingField(null);
    setFieldValue('');
  };
  const saveEdit = async () => {
    if (!profile) return;
    setLoading(true);
    const { error, data } = await supabase
      .from('DatasUser')
      .update({ [editingField!]: fieldValue })
      .eq('id', profile.id)
      .select();
    setLoading(false);
    if (error) {
      Alert.alert('Update error', error.message);
    } else {
      setProfile({ ...profile, [editingField!]: fieldValue });
      setEditingField(null);
      setFieldValue('');
    }
  };
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUploading(true);
      const imageUrl = result.assets[0].uri;
      // Optionally: upload to storage and save public URL
      const { error } = await supabase
        .from('users')
        .update({ image: imageUrl })
        .eq('id', profile.id);
      setImageUploading(false);
      if (error) {
        Alert.alert('Image update error', error.message);
      } else {
        setProfile({ ...profile, image: imageUrl });
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profile?.image || 'https://ui-avatars.com/api/?name=John+Doe&background=007AFF&color=fff&size=128' }} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Ionicons name="camera" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{profile?.name || ''}</Text>
          <Text style={styles.mail}>{profile?.email || ''}</Text>
        </View>
        {/* Details section */}
        <View style={styles.detailsSection}>
          {['age', 'bp', 'sugar', 'hba1c', 'glycemicIndex', 'cholesterol'].map((field) => (
            <View style={styles.detailRow} key={field}>
              <Text style={styles.detailLabel}>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</Text>
              {editingField === field ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={fieldValue}
                    onChangeText={setFieldValue}
                    keyboardType={field === 'age' ? 'numeric' : 'default'}
                    placeholder={field}
                    placeholderTextColor="#aaa"
                    autoFocus
                  />
                  <TouchableOpacity style={styles.iconButton} onPress={saveEdit} accessibilityLabel={`Save ${field}`}>
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={cancelEdit} accessibilityLabel={`Cancel editing ${field}`}>
                    <Ionicons name="close" size={20} color="#888" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.detailValue}>{profile?.[field] || ''}</Text>
                  <TouchableOpacity style={styles.iconButton} onPress={() => startEdit(field)} accessibilityLabel={`Edit ${field}`}>
                    <Ionicons name="pencil" size={18} color="#888" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Editable detail row
type ProfileDetailProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  isEditing: boolean;
  onEdit: () => void;
  onDone: () => void;
};

function ProfileDetail({ label, value, onChangeText, keyboardType, isEditing, onEdit, onDone }: ProfileDetailProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType || 'default'}
            placeholder={label}
            placeholderTextColor="#aaa"
            autoFocus
          />
          <TouchableOpacity style={styles.iconButton} onPress={onDone} accessibilityLabel={`Done editing ${label}`}>
            <Ionicons name="checkmark" size={20} color="#007AFF" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.detailValue}>{value}</Text>
          <TouchableOpacity style={styles.iconButton} onPress={onEdit} accessibilityLabel={`Edit ${label}`}>
            <Ionicons name="pencil" size={18} color="#888" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 40,
  },
  profileSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#d1fae5',
    borderRadius: 16,
    padding: 4,
    zIndex: 3,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 8,
    zIndex: 2,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  mail: {
    fontSize: 16,
    color: '#111',
    marginTop: 2,
  },
  detailsSection: {
    width: '90%',
    backgroundColor: '#047857',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '400',
  },
  input: {
    flex: 2,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  iconButton: {
    marginLeft: 8,
    padding: 2,
  },
});
