import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors } from '../theme/colors';
import type { Category } from '../types';
import type { ListingFilters } from '../utils/listingFilters';
import { Picker } from '@react-native-picker/picker';

type Props = {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  availableCities: string[];
  value: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onReset: () => void;
};

export default function FilterMenu({
  visible,
  onClose,
  categories,
  availableCities,
  value,
  onChange,
  onReset,
}: Props) {
  const [local, setLocal] = useState<ListingFilters>(value || {});

  useEffect(() => {
    setLocal(value || {});
  }, [value, visible]);

  const apply = () => {
    onChange(local);
    onClose();
  };

  const reset = () => {
    onReset();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Filters</Text>

          <ScrollView style={{ maxHeight: 380 }}>
            {/* Category (Berry type) */}
            <Text style={styles.label}>Berry type (Category)</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={local.categoryId ?? ''}
                onValueChange={(val: any) =>
                  setLocal(prev => ({ ...prev, categoryId: val ? Number(val) : null }))
                }
                dropdownIconColor={Colors.text}
                style={styles.picker}
              >
                <Picker.Item label="Any" value="" />
                {categories.map(c => (
                  <Picker.Item key={c.id} label={c.name} value={String(c.id)} />
                ))}
              </Picker>
            </View>

            {/* City */}
            <Text style={styles.label}>Location (City)</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={local.city ?? ''}
                onValueChange={(val: any) => setLocal(prev => ({ ...prev, city: val || null }))}
                dropdownIconColor={Colors.text}
                style={styles.picker}
              >
                <Picker.Item label="Any" value="" />
                {availableCities.map(city => (
                  <Picker.Item key={city} label={city} value={city} />
                ))}
              </Picker>
            </View>

            {/* Price */}
            <Text style={styles.label}>Price range (EUR)</Text>
            <View style={styles.row}>
              <TextInput
                keyboardType="numeric"
                placeholder="Min"
                placeholderTextColor={Colors.textMuted}
                value={local.priceMin != null ? String(local.priceMin) : ''}
                onChangeText={t =>
                  setLocal(prev => ({ ...prev, priceMin: t ? Number(t) : null }))
                }
                style={[styles.input, { marginRight: 8 }]}
              />
              <TextInput
                keyboardType="numeric"
                placeholder="Max"
                placeholderTextColor={Colors.textMuted}
                value={local.priceMax != null ? String(local.priceMax) : ''}
                onChangeText={t =>
                  setLocal(prev => ({ ...prev, priceMax: t ? Number(t) : null }))
                }
                style={styles.input}
              />
            </View>

            {/* Unit */}
            <Text style={styles.label}>Unit</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={local.unit ?? ''}
                onValueChange={(val: any) => setLocal(prev => ({ ...prev, unit: val || null }))}
                dropdownIconColor={Colors.text}
                style={styles.picker}
              >
                <Picker.Item label="Any" value="" />
                <Picker.Item label="KG" value="KG" />
                <Picker.Item label="G" value="G" />
              </Picker>
            </View>

            {/* Status filter removed per request */}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={reset}>
              <Text style={styles.btnGhostText}>Reset</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={apply}>
              <Text style={styles.btnPrimaryText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  sheet: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: { color: Colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 },
  label: { color: Colors.textSubtle, marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: Colors.surfaceMuted,
    color: Colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  pickerWrap: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  picker: {
    color: Colors.text,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { color: Colors.textSubtle, fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnGhost: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnGhostText: { color: Colors.textSubtle, fontWeight: '600' },
  btnPrimary: { backgroundColor: Colors.primary, marginLeft: 8 },
  btnPrimaryText: { color: Colors.text, fontWeight: '700' },
});
