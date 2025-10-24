import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { API_BASE_URL } from '../config';
import { Colors } from '../theme/colors';
import type { Category, Listing, ListingUnit } from '../types';
import { AuthContext } from '../auth/AuthContext';
import { Picker } from '@react-native-picker/picker';

type Props = {
  isGuest: boolean;
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  onCreated?: () => void | Promise<void>;
  existingListing?: Listing;
  mode?: 'create' | 'edit';
};

const unitOptions: ListingUnit[] = ['KG', 'G'];
const alphaSpacePattern = /^[\p{L}]+(?:\s[\p{L}]+)*$/u;
const cityPattern = alphaSpacePattern;
const titlePattern = alphaSpacePattern;

export default function CreateListingSection({
  isGuest,
  onLoginPress,
  onRegisterPress,
  onCreated,
  existingListing,
  mode = 'create',
}: Props) {
  const { token } = useContext(AuthContext);
  const [createTitle, setCreateTitle] = useState('');
  const [createPrice, setCreatePrice] = useState('');
  const [createCategoryId, setCreateCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFetchError, setCategoryFetchError] = useState<string | null>(
    null,
  );
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [createDescription, setCreateDescription] = useState('');
  const [createCity, setCreateCity] = useState('');
  const [createUnit, setCreateUnit] = useState<ListingUnit>('KG');
  const [createQuantity, setCreateQuantity] = useState('');
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [pendingCategoryId, setPendingCategoryId] = useState('');

  

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        setCategoryFetchError(null);
        const res = await fetch(`${API_BASE_URL}/api/categories`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Failed to load categories (${res.status})`);
        }

        const data: Category[] = await res.json();
        if (isMounted) {
          setCategories(data);
        }
      } catch (err: any) {
        if (isMounted && err?.name !== 'AbortError') {
          setCategoryFetchError('Could not load categories. Try again later.');
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
  if (mode === 'edit' && existingListing) {
    setCreateTitle(existingListing.title ?? '');
    setCreatePrice(existingListing.price ? String(existingListing.price) : '');
    setCreateCategoryId(existingListing.categoryId ? String(existingListing.categoryId) : '');
    setCreateDescription(existingListing.description ?? '');
    setCreateCity(existingListing.city ?? '');
    setCreateUnit(existingListing.unit ?? 'KG');
    setCreateQuantity(existingListing.quantity ? String(existingListing.quantity) : '');
  }
}, [mode, existingListing]);


  const selectedCategoryName = useMemo(() => {
    if (!createCategoryId) {
      return null;
    }
    const match = categories.find(cat => String(cat.id) === createCategoryId);
    return match?.name ?? null;
  }, [categories, createCategoryId]);

  const resetForm = () => {
    setCreateTitle('');
    setCreatePrice('');
    setCreateCategoryId('');
    setCreateDescription('');
    setCreateCity('');
    setCreateUnit('KG');
    setCreateQuantity('');
  };

  const handleSaveListing = async () => {
  if (isGuest || !token) {
    setCreateError('You must be logged in to create a listing.');
    return;
  }

  const priceValue = Number(createPrice);

    if (!createTitle.trim()) {
      setCreateError('Title is required.');
      return;
    }
    if (!titlePattern.test(createTitle.trim())) {
      setCreateError('Title may contain only letters and spaces.');
      return;
    }

  if (Number.isNaN(priceValue) || priceValue <= 0) {
    setCreateError('Enter a valid price.');
    return;
  }

    if (!createCity.trim()) {
      setCreateError('City is required.');
      return;
    }

    if (!cityPattern.test(createCity.trim())) {
      setCreateError('City may contain only letters and spaces.');
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
      const payload = {
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        price: priceValue,
        currency: 'EUR',
        quantity: createQuantity ? Number(createQuantity) : undefined,
        unit: createUnit,
        city: createCity.trim(),
        categoryId: categoryValue,
      };

      const url =
        mode === 'edit' && existingListing
          ? `${API_BASE_URL}/api/listings/${existingListing.id}`
          : `${API_BASE_URL}/api/listings`;

      const method = mode === 'edit' && existingListing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed (${res.status})`);
    }

    if (mode === 'edit') {
      setCreateMessage('Listing updated! Pending review if it was rejected.');
    } else {
      setCreateMessage('Listing submitted! Pending approval.');
      resetForm();
    }

    await onCreated?.();
  } catch (e: any) {
    setCreateError(e?.message ?? 'Failed to save listing');
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
          placeholderTextColor={Colors.placeholder}
          value={createTitle}
          onChangeText={text => {
            setCreateTitle(text);
            setCreateError(null);
          }}
          style={styles.createInput}
        />
        <TextInput
          placeholder="Price (EUR)"
          placeholderTextColor={Colors.placeholder}
          keyboardType="decimal-pad"
          value={createPrice}
          onChangeText={text => {
            setCreatePrice(text);
            setCreateError(null);
          }}
          style={styles.createInput}
        />
        <View style={styles.categoryPickerWrapper}>
          <Pressable
            style={({ pressed }) => [
              styles.categorySelect,
              pressed && styles.categorySelectPressed,
              !categories.length &&
              !categoryFetchError &&
              styles.categorySelectDisabled,
            ]}
            disabled={!categories.length && !categoryFetchError}
            onPress={() => {
              if (!categories.length && !categoryFetchError) {
                return;
              }
              setPendingCategoryId(
                createCategoryId || categories[0]?.id?.toString() || '',
              );
              setCategoryModalVisible(true);
            }}
          >
            <Text
              style={
                selectedCategoryName
                  ? styles.categorySelectedText
                  : styles.categoryPlaceholderText
              }
              numberOfLines={1}
            >
              {selectedCategoryName ?? 'Select a category'}
            </Text>
            <Text style={styles.categoryChevron}>▼</Text>
          </Pressable>
          {categoryFetchError ? (
            <Text style={styles.categoryError}>{categoryFetchError}</Text>
          ) : null}
        </View>
        <Modal
          transparent
          animationType="slide"
          visible={categoryModalVisible}
          onRequestClose={() => setCategoryModalVisible(false)}
        >
          <View style={styles.categoryModalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setCategoryModalVisible(false)}
            />
            <View style={styles.categoryPickerSheet}>
              <View style={styles.categoryPickerToolbar}>
                <TouchableOpacity
                  onPress={() => {
                    setPendingCategoryId(createCategoryId);
                    setCategoryModalVisible(false);
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.categoryToolbarText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.categoryToolbarTitle}>Category</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCreateCategoryId(pendingCategoryId);
                    setCreateError(null);
                    setCategoryModalVisible(false);
                  }}
                  hitSlop={8}
                >
                  <Text
                    style={[
                      styles.categoryToolbarText,
                      styles.categoryToolbarConfirm,
                    ]}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={pendingCategoryId}
                onValueChange={value => setPendingCategoryId(String(value))}
              >
                <Picker.Item label="Select a category" value="" />
                {categories.map(category => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={String(category.id)}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
        <TextInput
          placeholder="City (optional)"
          placeholderTextColor={Colors.placeholder}
          value={createCity}
          onChangeText={text => {
            setCreateCity(text);
            setCreateError(null);
          }}
          style={styles.createInput}
        />
        <TextInput
          placeholder="Quantity (optional)"
          placeholderTextColor={Colors.placeholder}
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
          placeholderTextColor={Colors.placeholder}
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
      onPress={handleSaveListing}
      disabled={createLoading}
>
      <Text style={styles.createBtnText}>
        {createLoading
          ? (mode === 'edit' ? 'Saving…' : 'Submitting…')
          : mode === 'edit'
          ? 'Save changes'
          : 'Create listing'}
        </Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  unitPickerWrapper: {
    marginTop: 8,
  },
  unitLabel: {
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  unitPicker: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
  },
  categoryPickerWrapper: {
    gap: 6,
  },
  categoryLabel: {
    color: Colors.text,
    fontWeight: '600',
  },
  categorySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
  },
  categorySelectPressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  categorySelectDisabled: {
    opacity: 0.6,
  },
  categorySelectedText: {
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  categoryPlaceholderText: {
    color: Colors.textMuted,
    flex: 1,
    marginRight: 8,
  },
  categoryChevron: {
    color: Colors.textSubtle,
    fontSize: 16,
  },
  categoryError: {
    color: Colors.error,
    fontSize: 12,
  },
  categoryModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryPickerSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    flex: 0.45,
  },
  categoryPickerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  categoryToolbarText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  categoryToolbarConfirm: {
    fontWeight: '700',
  },
  categoryToolbarTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  createScroll: { flex: 1, backgroundColor: Colors.background },
  createScrollContent: { paddingBottom: 32 },
  createBox: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  createTitle: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  createInput: {
    backgroundColor: Colors.surfaceMuted,
    color: Colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitChipText: {
    color: Colors.textSubtle,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  unitChipTextActive: {
    color: Colors.text,
  },
  createTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  createBtnText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  createError: {
    color: Colors.error,
    fontSize: 13,
  },
  createSuccess: {
    color: Colors.success,
    fontSize: 13,
  },
  guestNotice: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  guestNoticeTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  guestNoticeText: {
    color: Colors.textSubtle,
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
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceMuted,
  },
  secondaryBtnText: {
    color: Colors.textSubtle,
    fontWeight: '600',
  },
  secondaryBtnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  secondaryBtnPrimaryText: {
    color: 'white',
    fontWeight: '700',
  },
});