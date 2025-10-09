import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import type { ListingUnit } from '../types';

type CreateFormProps = {
  createTitle: string;
  setCreateTitle: (v: string) => void;
  createPrice: string;
  setCreatePrice: (v: string) => void;
  createCategoryId: string;
  setCreateCategoryId: (v: string) => void;
  createCity: string;
  setCreateCity: (v: string) => void;
  createQuantity: string;
  setCreateQuantity: (v: string) => void;
  createDescription: string;
  setCreateDescription: (v: string) => void;
  createUnit: ListingUnit;
  setCreateUnit: (v: ListingUnit) => void;
  unitOptions: ListingUnit[];
  createError: string | null;
  createMessage: string | null;
  createLoading: boolean;
  handleCreateListing: () => Promise<void>;
};

export default function CreateForm({
  createTitle,
  setCreateTitle,
  createPrice,
  setCreatePrice,
  createCategoryId,
  setCreateCategoryId,
  createCity,
  setCreateCity,
  createQuantity,
  setCreateQuantity,
  createDescription,
  setCreateDescription,
  createUnit,
  setCreateUnit,
  unitOptions,
  createError,
  createMessage,
  createLoading,
  handleCreateListing,
}: CreateFormProps) {
  return (
    <View style={styles.createBox}>
      <Text style={styles.createTitle}>Create a test listing</Text>
      <TextInput
        placeholder="Title"
        placeholderTextColor="#64748b"
        value={createTitle}
        onChangeText={setCreateTitle}
        style={styles.createInput}
      />
      <TextInput
        placeholder="Price (EUR)"
        placeholderTextColor="#64748b"
        keyboardType="decimal-pad"
        value={createPrice}
        onChangeText={setCreatePrice}
        style={styles.createInput}
      />
      <TextInput
        placeholder="Category ID"
        placeholderTextColor="#64748b"
        keyboardType="number-pad"
        value={createCategoryId}
        onChangeText={setCreateCategoryId}
        style={styles.createInput}
      />
      <TextInput
        placeholder="City (optional)"
        placeholderTextColor="#64748b"
        value={createCity}
        onChangeText={setCreateCity}
        style={styles.createInput}
      />
      <TextInput
        placeholder="Quantity (optional)"
        placeholderTextColor="#64748b"
        keyboardType="decimal-pad"
        value={createQuantity}
        onChangeText={setCreateQuantity}
        style={styles.createInput}
      />
      <View style={styles.unitRow}>
        {unitOptions.map(unit => {
          const isActive = createUnit === unit;
          return (
            <TouchableOpacity
              key={unit}
              style={[styles.unitChip, isActive && styles.unitChipActive]}
              onPress={() => setCreateUnit(unit)}
            >
              <Text style={[styles.unitChipText, isActive && styles.unitChipTextActive]}>
                {unit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TextInput
        placeholder="Description (optional)"
        placeholderTextColor="#64748b"
        multiline
        numberOfLines={3}
        value={createDescription}
        onChangeText={setCreateDescription}
        style={[styles.createInput, styles.createTextarea]}
      />
      {createError && <Text style={styles.createError}>{createError}</Text>}
      {createMessage && <Text style={styles.createSuccess}>{createMessage}</Text>}
      <TouchableOpacity
        style={[styles.createBtn, createLoading && { opacity: 0.6 }]}
        onPress={handleCreateListing}
        disabled={createLoading}
      >
        <Text style={styles.createBtnText}>
          {createLoading ? 'Submitting…' : 'Create listing'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  createBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  createTitle: { color: 'white', fontWeight: '700', fontSize: 16, marginBottom: 8 },
  createInput: {
    backgroundColor: '#0f172a',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  unitRow: { flexDirection: 'row', marginBottom: 8 },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    marginRight: 8,
  },
  unitChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  unitChipText: { color: '#cbd5e1', fontWeight: '600', letterSpacing: 0.5 },
  unitChipTextActive: { color: 'white' },
  createTextarea: { minHeight: 80, textAlignVertical: 'top' },
  createBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  createBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  createError: { color: '#fda4af', fontSize: 13, marginTop: 4 },
  createSuccess: { color: '#bbf7d0', fontSize: 13, marginTop: 4 },
});
