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
  Image,
  Alert,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { API_BASE_URL } from '../config';
import type { Category, ListingUnit } from '../types';
import { AuthContext } from '../auth/AuthContext';
import { Picker } from '@react-native-picker/picker';

type Props = {
  isGuest: boolean;
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  onCreated?: () => void | Promise<void>;
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
  const [selectedImages, setSelectedImages] = useState<
    { uri: string; base64?: string }[]
  >([]);
  const [imageError, setImageError] = useState<string | null>(null);

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

  const selectedCategoryName = useMemo(() => {
    if (!createCategoryId) {
      return null;
    }
    const match = categories.find(cat => String(cat.id) === createCategoryId);
    return match?.name ?? null;
  }, [categories, createCategoryId]);

  const selectImage = () => {
    console.log('selectImage called');
    Alert.alert('Select Image', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          console.log('Camera button pressed');
          openCamera();
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          console.log('Gallery button pressed');
          openGallery();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = () => {
    console.log('Opening camera...');
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      console.log('Camera response:', response);
      if (response.didCancel) {
        console.log('User cancelled camera');
        return;
      }
      if (response.errorMessage) {
        console.log('Camera error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        console.log('Adding image from camera:', asset.uri);
        setSelectedImages([
          ...selectedImages,
          {
            uri: asset.uri!,
            base64: asset.base64,
          },
        ]);
      }
    });
  };

  const openGallery = () => {
    console.log('Opening gallery...');
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: true,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      console.log('Gallery response:', response);
      if (response.didCancel) {
        console.log('User cancelled gallery');
        return;
      }
      if (response.errorMessage) {
        console.log('Gallery error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage);
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        console.log('Adding image from gallery:', asset.uri);
        setSelectedImages([
          ...selectedImages,
          {
            uri: asset.uri!,
            base64: asset.base64,
          },
        ]);
      }
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const resetForm = () => {
    setCreateTitle('');
    setCreatePrice('');
    setCreateCategoryId('');
    setCreateDescription('');
    setCreateCity('');
    setCreateUnit('KG');
    setCreateQuantity('');
    setSelectedImages([]);
    setImageError(null);
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
          city: createCity.trim(),
          categoryId: categoryValue,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Create failed (${res.status})`);
      }

      const createdListing = await res.json();

      // Add images if provided
      if (selectedImages.length > 0) {
        try {
          for (let i = 0; i < selectedImages.length; i++) {
            const image = selectedImages[i];
            console.log(
              `Uploading image ${i + 1} for listing ${createdListing.id}`,
            );

            const imagePath = image.base64
              ? `data:image/jpeg;base64,${image.base64}`
              : image.uri;
            console.log(`Image path length: ${imagePath.length}`);

            const response = await fetch(
              `${API_BASE_URL}/api/listings/${createdListing.id}/images`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  path: imagePath,
                  sortOrder: i + 1,
                }),
              },
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                `Failed to upload image ${i + 1}:`,
                response.status,
                errorText,
              );
              throw new Error(
                `Failed to upload image ${i + 1}: ${response.status}`,
              );
            } else {
              console.log(`Successfully uploaded image ${i + 1}`);
            }
          }
        } catch (imageError) {
          console.error('Failed to add some images:', imageError);
          setImageError('Listing created but some images failed to upload.');
        }
      }

      setCreateMessage('Listing submitted! Pending approval.');
      resetForm();

      // Call onCreated callback after everything is done, including image uploads
      // Backend operations are already complete at this point since we awaited all fetch calls
      if (onCreated) {
        await onCreated();
      }
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
          placeholder="City"
          placeholderTextColor="#94a3b8"
          value={createCity}
          onChangeText={text => {
            setCreateCity(text);
            setCreateError(null);
          }}
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

        {/* Images Section */}
        <View style={styles.imageSection}>
          <Text style={styles.imageSectionTitle}>Images (optional)</Text>

          {/* Display selected images */}
          {selectedImages.length > 0 && (
            <ScrollView horizontal style={styles.imagePreviewContainer}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.imagePreviewItem}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeImagePreviewBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImagePreviewBtnText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Add image button */}
          {selectedImages.length < 5 && (
            <TouchableOpacity style={styles.addImageBtn} onPress={selectImage}>
              <Text style={styles.addImageBtnText}>📷 Add Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {imageError ? (
          <Text style={styles.createError}>{imageError}</Text>
        ) : null}
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
  unitPickerWrapper: {
    marginTop: 8,
  },
  unitLabel: {
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 4,
  },
  unitPicker: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  categoryPickerWrapper: {
    gap: 6,
  },
  categoryLabel: {
    color: '#0f172a',
    fontWeight: '600',
  },
  categorySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },
  categorySelectPressed: {
    backgroundColor: '#e2e8f0',
  },
  categorySelectDisabled: {
    opacity: 0.6,
  },
  categorySelectedText: {
    color: '#0f172a',
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  categoryPlaceholderText: {
    color: '#94a3b8',
    flex: 1,
    marginRight: 8,
  },
  categoryChevron: {
    color: '#475569',
    fontSize: 16,
  },
  categoryError: {
    color: '#b91c1c',
    fontSize: 12,
  },
  categoryModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryPickerSheet: {
    backgroundColor: '#ffffff',
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
    borderBottomColor: '#e2e8f0',
  },
  categoryToolbarText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  categoryToolbarConfirm: {
    fontWeight: '700',
  },
  categoryToolbarTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
  },
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
  imageSection: {
    marginTop: 16,
  },
  imageSectionTitle: {
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  imageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageInput: {
    flex: 1,
  },
  removeImageBtn: {
    marginLeft: 8,
    width: 30,
    height: 30,
    backgroundColor: '#ef4444',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  removeImagePreviewBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImagePreviewBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addImageBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addImageBtnText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  imagePreviewItem: {
    marginRight: 8,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
});
