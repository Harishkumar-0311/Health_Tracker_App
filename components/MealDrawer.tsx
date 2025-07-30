import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Food {
  id: string;
  name: string;
}

interface MealDrawerProps {
  meal: string;
  icon?: string;
  iconColor?: string;
  foods: Food[];
  checkedFoods: { [id: string]: boolean };
  onToggleFood: (id: string) => void;
}

const MealDrawer: React.FC<MealDrawerProps> = ({ meal, icon, iconColor = '#fff', foods, checkedFoods, onToggleFood }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.drawerSection}>
      <TouchableOpacity style={styles.drawerHeader} onPress={() => setOpen(!open)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && (
            <Ionicons name={icon as any} size={22} color={iconColor} style={{ marginRight: 8 }} />
          )}
          <Text style={styles.drawerHeaderText}>{meal}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={22} color="#fff" />
      </TouchableOpacity>
      {open && (
        <View style={styles.drawerContent}>
          {foods.length === 0 ? (
            <Text style={styles.emptyText}>No foods for this meal.</Text>
          ) : (
            <FlatList
              data={foods}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.foodRow}
                  onPress={() => onToggleFood(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={checkedFoods[item.id] ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={checkedFoods[item.id] ? '#2186eb' : '#bbb'}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={styles.foodName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#047857',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
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
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  foodName: {
    fontSize: 16,
    color: '#fff',
  },
  emptyText: {
    color: '#d1fae5',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
});

export default MealDrawer;
