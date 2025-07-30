import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import MealDrawer from '../components/MealDrawer';

const HomeScreen = () => {
  const [userName, setUserName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkedFoods, setCheckedFoods] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('userProfile');
        if (!stored) return;
        const user = JSON.parse(stored);
        const { data, error } = await supabase
          .from('DatasUser')
          .select('name')
          .eq('id', user.id)
          .single();
        if (!error && data) {
          setUserName(data.name);
        } else if (user.name) {
          setUserName(user.name);
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const handleToggleFood = (id: string) => {
    setCheckedFoods(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Diet planner meal data
  const mealSections = [
    {
      meal: 'Breakfast',
      icon: 'cafe-outline',
      iconColor: '#ff9800',
      foods: [
        { id: 'oats', name: 'Oats Porridge' },
        { id: 'egg', name: 'Boiled Egg' },
      ],
    },
    {
      meal: 'Lunch',
      icon: 'fast-food-outline',
      iconColor: '#43a047',
      foods: [
        { id: 'salad', name: 'Vegetable Salad' },
        { id: 'dal', name: 'Dal' },
        { id: 'roti', name: 'Whole Wheat Roti' },
      ],
    },
    {
      meal: 'Snack',
      icon: 'ice-cream-outline',
      iconColor: '#8e24aa',
      foods: [
        { id: 'nuts', name: 'Handful of Nuts' },
        { id: 'fruit', name: 'Low GI Fruit' },
      ],
    },
    {
      meal: 'Dinner',
      icon: 'restaurant-outline',
      iconColor: '#1565c0',
      foods: [
        { id: 'grilled', name: 'Grilled Chicken/Fish' },
        { id: 'soup', name: 'Vegetable Soup' },
      ],
    },
  ];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      data={mealSections}
      keyExtractor={item => item.meal}
      renderItem={({ item }) => (
        <MealDrawer
          key={item.meal}
          meal={item.meal}
          icon={item.icon}
          iconColor={item.iconColor}
          foods={item.foods}
          checkedFoods={checkedFoods}
          onToggleFood={(id: string) => {
            setCheckedFoods(prev => {
              const updated = { ...prev, [id]: !prev[id] };
              if (!prev[id]) {
                Alert.alert('Diet Planner', 'Great job! You have completed this food.', [{ text: 'OK' }]);
              }
              return updated;
            });
          }}
        />
      )}
      ListHeaderComponent={
        <>
          {/* Dashboard/Health Icons */}
          <View style={styles.dashboardRow}>
            <FontAwesome5 name="heartbeat" size={28} color="#2186eb" style={styles.healthIcon} />
            <MaterialCommunityIcons name="lifebuoy" size={30} color="#f7b731" style={styles.healthIcon} />
          </View>
          {/* Welcome */}
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <Text style={styles.welcomeText}>Welcome{userName ? `! ${userName}` : '!'}</Text>
          )}
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search foods..."
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
          {/* Diet Planner */}
          <Text style={styles.sectionTitle}>Diet Planner</Text>
        </>
      }
    />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 40,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047857',
    borderRadius: 8,
    padding: 10,
    marginBottom: 18,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2186eb',
    marginBottom: 10,
    marginTop: 4,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d1fae5',
    marginTop: 18,
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047857',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  mealLabel: {
    fontSize: 16,
    flex: 1,
    color: '#222',
  },
  checkboxWrapper: {
    marginLeft: 10,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  healthIcon: {
    marginHorizontal: 10,
  },
  petal: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  petalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mealPopover: {
    position: 'absolute',
    top: 95,
    left: '50%',
    transform: [{ translateX: -70 }],
    minWidth: 140,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    zIndex: 10,
  },
  mealPopoverTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2186eb',
    marginBottom: 6,
    textAlign: 'center',
  },
  mealItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  flowerCenter: {
    position: 'absolute',
    left: 87,
    top: 87,
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#2186eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  clearBtn: {
    backgroundColor: '#ff9800',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 22,
    alignSelf: 'center',
    marginTop: 18,
    elevation: 2,
  },
  suggestionBox: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 10,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: '#eee',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 36,
    alignItems: 'center',
    minHeight: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  profileRole: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  profileEditBtn: {
    marginLeft: 'auto',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 7,
    elevation: 2,
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  dashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
    width: '90%',
    alignSelf: 'flex-start',
  },
  drawerSection: {
    marginBottom: 18,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2186eb', // Bright blue
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 0,
  },
  drawerHeaderOpen: {
    backgroundColor: '#1560bd', // Slightly darker when open
  },
  drawerHeaderText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  drawerContent: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2186eb',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#2186eb',
    borderColor: '#2186eb',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalWindow: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 26,
    alignItems: 'center',
    width: 270,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  modalText: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 18,
    color: '#d1fae5',
    textAlign: 'center',
  },
  modalBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalBtn: {
    backgroundColor: '#2186eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginHorizontal: 8,
  },
  modalBtnCancel: {
    backgroundColor: '#aaa',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dietPlannerContainer: {
    marginTop: 32,
    width: '90%',
    backgroundColor: '#047857',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dietPlannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dietPlannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0096ff',
    textAlign: 'center',
  },
  mealSection: {
    marginBottom: 16,
  },
  mealItem: {
    alignItems: 'center',
    width: '100%',
    height: 44,
    borderRadius: 8,
    borderColor: '#047857',
    borderWidth: 1,
    alignSelf: 'center',
  },

});
