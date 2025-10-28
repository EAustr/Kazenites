import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { Colors } from '../theme/colors';
import type { Category } from '../types';
import type { ListingFilters } from '../utils/listingFilters';

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
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Filters</Text>

          <ScrollView style={{ maxHeight: 500 }}>
            {/* Category (Berry type) */}
            <Text style={styles.label}>Berry type (Category)</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setCategoryOpen(!categoryOpen)}
            >
              <Text style={styles.selectText}>
                {local.categoryId
                  ? categories.find(c => c.id === local.categoryId)?.name
                  : 'Any'}
              </Text>
              <Text style={styles.arrow}>{categoryOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {categoryOpen && (
              <ScrollView style={styles.optionsList}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    !local.categoryId && styles.optionActive,
                  ]}
                  onPress={() => {
                    setLocal(prev => ({ ...prev, categoryId: null }));
                    setCategoryOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      !local.categoryId && styles.optionTextActive,
                    ]}
                  >
                    Any
                  </Text>
                </TouchableOpacity>
                {categories.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.option,
                      local.categoryId === c.id && styles.optionActive,
                    ]}
                    onPress={() => {
                      setLocal(prev => ({ ...prev, categoryId: c.id }));
                      setCategoryOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        local.categoryId === c.id && styles.optionTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* City */}
            <Text style={styles.label}>Location (City)</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setCityOpen(!cityOpen)}
            >
              <Text style={styles.selectText}>{local.city || 'Any'}</Text>
              <Text style={styles.arrow}>{cityOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {cityOpen && (
              <ScrollView style={styles.optionsList}>
                <TouchableOpacity
                  style={[styles.option, !local.city && styles.optionActive]}
                  onPress={() => {
                    setLocal(prev => ({ ...prev, city: null }));
                    setCityOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      !local.city && styles.optionTextActive,
                    ]}
                  >
                    Any
                  </Text>
                </TouchableOpacity>
                {availableCities.map(city => (
                  <TouchableOpacity
                    key={city}
                    style={[
                      styles.option,
                      local.city === city && styles.optionActive,
                    ]}
                    onPress={() => {
                      setLocal(prev => ({ ...prev, city }));
                      setCityOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        local.city === city && styles.optionTextActive,
                      ]}
                    >
                      {city}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Price */}
            <Text style={styles.label}>Price range (EUR)</Text>
            <View style={styles.row}>
              <TextInput
                keyboardType="numeric"
                placeholder="Min"
                placeholderTextColor={Colors.textMuted}
                value={local.priceMin != null ? String(local.priceMin) : ''}
                onChangeText={t =>
                  setLocal(prev => ({
                    ...prev,
                    priceMin: t ? Number(t) : null,
                  }))
                }
                style={[styles.input, { marginRight: 8 }]}
              />
              <TextInput
                keyboardType="numeric"
                placeholder="Max"
                placeholderTextColor={Colors.textMuted}
                value={local.priceMax != null ? String(local.priceMax) : ''}
                onChangeText={t =>
                  setLocal(prev => ({
                    ...prev,
                    priceMax: t ? Number(t) : null,
                  }))
                }
                style={styles.input}
              />
            </View>

            {/* Unit */}
            <Text style={styles.label}>Unit</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, !local.unit && styles.chipActive]}
                onPress={() => setLocal(prev => ({ ...prev, unit: null }))}
              >
                <Text
                  style={[
                    styles.chipText,
                    !local.unit && styles.chipTextActive,
                  ]}
                >
                  Any
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, local.unit === 'KG' && styles.chipActive]}
                onPress={() => setLocal(prev => ({ ...prev, unit: 'KG' }))}
              >
                <Text
                  style={[
                    styles.chipText,
                    local.unit === 'KG' && styles.chipTextActive,
                  ]}
                >
                  KG
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, local.unit === 'G' && styles.chipActive]}
                onPress={() => setLocal(prev => ({ ...prev, unit: 'G' }))}
              >
                <Text
                  style={[
                    styles.chipText,
                    local.unit === 'G' && styles.chipTextActive,
                  ]}
                >
                  G
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status filter removed per request */}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={reset}
            >
              <Text style={styles.btnGhostText}>Reset</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={onClose}
            >
              <Text style={styles.btnGhostText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={apply}
            >
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
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '80%',
  },
  title: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 16,
  },
  label: {
    color: Colors.textSubtle,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surfaceMuted,
    color: Colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flex: 1,
    fontSize: 16,
  },
  selectBox: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    color: Colors.text,
    fontSize: 16,
  },
  arrow: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  optionsList: {
    marginTop: 8,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 150,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionActive: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    color: Colors.text,
    fontSize: 15,
  },
  optionTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  chipRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  chip: {
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { color: Colors.textSubtle, fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: Colors.text, fontWeight: '700' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
