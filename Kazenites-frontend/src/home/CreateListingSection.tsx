import React, { useContext, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { API_BASE_URL } from '../config';
import type { ListingUnit } from '../types';
import { AuthContext } from '../auth/AuthContext';

type Props = {
  isGuest: boolean;
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  onCreated?: () => void | Promise<void>;
};

const unitOptions: ListingUnit[] = ['KG', 'G'];

export default function CreateListingSection({
  isGuest,
  onLoginPress,
  onRegisterPress,
  onCreated,
}: Props) {
  const { token } = useContext(AuthContext);
  const [createTitle, setCreateTitle] = useState('');
  const [createPrice, setCreatePrice] = useState('');
  const [createCategoryId, setCreateCategoryId] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createCity, setCreateCity] = useState('');
  const [createUnit, setCreateUnit] = useState<ListingUnit>('KG');
  const [createQuantity, setCreateQuantity] = useState('');
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  const resetForm = () => {
    setCreateTitle('');
    setCreatePrice('');
    setCreateCategoryId('');
    setCreateDescription('');
    setCreateCity('');
    setCreateUnit('KG');
    setCreateQuantity('');
  };

  const handleCreateListing = async () => {
    if (isGuest || !token) {
      setCreateError('You must be logged in to create a listing.');
      return;
    }

    const priceValue = Number(createPrice);

    if (!createTitle.trim()) {
      setCreateError('Title is required.');
      return;
    }

    if (Number.isNaN(priceValue) || priceValue <= 0) {
      setCreateError('Enter a valid price.');
      return;
    }

    const categoryValue = Number(createCategoryId);
    if (!createCategoryId.trim() || Number.isNaN(categoryValue)) {
      setCreateError('Provide a category ID (number).');
      return;
    }

    setCreateError(null);
    setCreateMessage(null);
    setCreateLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: createTitle.trim(),
          description: createDescription.trim() || undefined,
          price: priceValue,
          currency: 'EUR',
          quantity: createQuantity ? Number(createQuantity) : undefined,
          unit: createUnit,
          city: createCity.trim() || undefined,
          categoryId: categoryValue,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Create failed (${res.status})`);
      }

      setCreateMessage('Listing submitted! Pending approval.');
      resetForm();
      await onCreated?.();
    } catch (e: any) {
      setCreateError(e?.message ?? 'Failed to create listing');
    } finally {
      setCreateLoading(false);
    }
  };

  if (isGuest) {
    return (
      <ScrollView
        style={styles.createScroll}
        contentContainerStyle={styles.createScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.guestNotice}>
          <Text style={styles.guestNoticeTitle}>
            Sign in to create listings
          </Text>
          <Text style={styles.guestNoticeText}>
            Only registered users can create listings. Please log in or register
            to continue.
          </Text>
          <View style={styles.guestActions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onLoginPress}
            >
              <Text style={styles.secondaryBtnText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, styles.secondaryBtnPrimary]}
              onPress={onRegisterPress}
            >
              <Text style={styles.secondaryBtnPrimaryText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.createScroll}
      contentContainerStyle={styles.createScrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.createBox}>
        <Text style={styles.createTitle}>Create a test listing</Text>
        <TextInput
          placeholder="Title"
          placeholderTextColor="#94a3b8"
          value={createTitle}
          onChangeText={text => {
            setCreateTitle(text);
            setCreateError(null);
          }}
          style={styles.createInput}
        />
        <TextInput
          placeholder="Price (EUR)"
          placeholderTextColor="#94a3b8"
          keyboardType="decimal-pad"
          value={createPrice}
          onChangeText={text => {
            setCreatePrice(text);
            setCreateError(null);
          }}
          style={styles.createInput}
        />
        <TextInput
          placeholder="Category ID"
          placeholderTextColor="#94a3b8"
          keyboardType="number-pad"
          value={createCategoryId}
          onChangeText={text => {
            setCreateCategoryId(text);
            setCreateError(null);
          }}
          style={styles.createInput}
        />
        <TextInput
          placeholder="City (optional)"
          placeholderTextColor="#94a3b8"
          value={createCity}
          onChangeText={setCreateCity}
          style={styles.createInput}
        />
        <TextInput
          placeholder="Quantity (optional)"
          placeholderTextColor="#94a3b8"
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
                <Text
                  style={[
                    styles.unitChipText,
                    isActive && styles.unitChipTextActive,
                  ]}
                >
                  {unit}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TextInput
          placeholder="Description (optional)"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
          value={createDescription}
          onChangeText={setCreateDescription}
          style={[styles.createInput, styles.createTextarea]}
        />
        {createError ? (
          <Text style={styles.createError}>{createError}</Text>
        ) : null}
        {createMessage ? (
          <Text style={styles.createSuccess}>{createMessage}</Text>
        ) : null}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  createScroll: { flex: 1, backgroundColor: '#f8fafc' },
  createScrollContent: { paddingBottom: 32 },
  createBox: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  createTitle: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  createInput: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  unitChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  unitChipText: {
    color: '#475569',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  unitChipTextActive: {
    color: 'white',
  },
  createTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  createError: {
    color: '#b91c1c',
    fontSize: 13,
  },
  createSuccess: {
    color: '#047857',
    fontSize: 13,
  },
  guestNotice: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  guestNoticeTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
  guestNoticeText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  guestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    backgroundColor: '#f1f5f9',
  },
  secondaryBtnText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  secondaryBtnPrimary: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  secondaryBtnPrimaryText: {
    color: 'white',
    fontWeight: '700',
  },
});
