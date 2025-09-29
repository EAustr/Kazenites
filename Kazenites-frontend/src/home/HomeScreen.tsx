import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config';
import type { Listing, ListingUnit } from '../types';
import { AuthContext } from '../auth/AuthContext';

type Props = {
  isGuest: boolean;
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  onLogoutPress?: () => void;
};

export default function HomeScreen({
  isGuest,
  onLoginPress,
  onRegisterPress,
  onLogoutPress,
}: Props) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const { token } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');

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

  const unitOptions: ListingUnit[] = ['KG', 'G'];

  const handleTabPress = (tab: 'browse' | 'create') => {
    setActiveTab(tab);
    if (tab === 'browse') {
      setCreateError(null);
      setCreateMessage(null);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = q
        ? `${API_BASE_URL}/api/listings?q=${encodeURIComponent(q)}`
        : `${API_BASE_URL}/api/listings`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to load listings (${res.status})`);
      const json = await res.json();
      setItems(json);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const header = useMemo(
    () => (
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.brand}>Kazenites</Text>
          <View style={styles.headerActions}>
            {isGuest ? (
              <>
                <TouchableOpacity style={styles.linkBtn} onPress={onLoginPress}>
                  <Text style={styles.linkText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.linkBtn, styles.primaryBtn]}
                  onPress={onRegisterPress}
                >
                  <Text style={[styles.linkText, styles.primaryText]}>
                    Register
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.linkBtn} onPress={onLogoutPress}>
                <Text style={styles.linkText}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    ),
    [isGuest, onLoginPress, onRegisterPress, onLogoutPress],
  );

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
      setCreateTitle('');
      setCreatePrice('');
      setCreateCategoryId('');
    setCreateDescription('');
    setCreateCity('');
    setCreateUnit('KG');
      setCreateQuantity('');
      await fetchListings();
    } catch (e: any) {
      setCreateError(e?.message ?? 'Failed to create listing');
    } finally {
      setCreateLoading(false);
    }
  };
  const renderItem = ({ item }: { item: Listing }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardPrice}>€{item.price.toFixed(2)}</Text>
      </View>
      {item.city ? <Text style={styles.cardMeta}>{item.city}</Text> : null}
      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description || ''}
      </Text>
      <View style={styles.pillRow}>
        <Text style={styles.pill}>{item.status}</Text>
        {item.unit ? <Text style={styles.pill}>{item.unit}</Text> : null}
      </View>
    </View>
  );

  const renderCreateForm = () => (
    <View style={styles.createBox}>
      <Text style={styles.createTitle}>Create a test listing</Text>
      <TextInput
        placeholder="Title"
        placeholderTextColor="#64748b"
        value={createTitle}
        onChangeText={text => {
          setCreateTitle(text);
          setCreateError(null);
        }}
        style={styles.createInput}
      />
      <TextInput
        placeholder="Price (EUR)"
        placeholderTextColor="#64748b"
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
        placeholderTextColor="#64748b"
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
      {createError ? <Text style={styles.createError}>{createError}</Text> : null}
      {createMessage ? <Text style={styles.createSuccess}>{createMessage}</Text> : null}
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

  const renderCreateContent = () => {
    if (isGuest) {
      return (
        <View style={styles.guestNotice}>
          <Text style={styles.guestNoticeTitle}>Sign in to create listings</Text>
          <Text style={styles.guestNoticeText}>
            Only registered users can create listings. Please log in or register to continue.
          </Text>
          <View style={styles.guestActions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onLoginPress}>
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
      );
    }

    return renderCreateForm();
  };

  const renderBrowseContent = () => (
    <>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search listings..."
          value={q}
          onChangeText={setQ}
          style={styles.searchInput}
          returnKeyType="search"
          onSubmitEditing={fetchListings}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={fetchListings}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>
      {loading && (
        <View style={styles.centerRow}>
          <ActivityIndicator />
        </View>
      )}
      {error && (
        <View style={styles.centerRow}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={x => String(x.id)}
        contentContainerStyle={styles.list}
        style={{ flex: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </>
  );

  return (
    <View style={styles.screen}>
      {header}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'browse' && styles.tabButtonActive]}
            onPress={() => handleTabPress('browse')}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'browse' && styles.tabButtonTextActive]}
            >
              Browse
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'create' && styles.tabButtonActive]}
            onPress={() => handleTabPress('create')}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'create' && styles.tabButtonTextActive]}
            >
              Create
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {activeTab === 'browse' ? (
        renderBrowseContent()
      ) : (
        <ScrollView
          style={styles.createScroll}
          contentContainerStyle={styles.createScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderCreateContent()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b0f14' },
  headerSafe: { backgroundColor: '#0b0f14' },
  header: {
    paddingTop: Platform.select({ ios: 12, android: 8 }),
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0b0f14',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: 'white', fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 8 },
  linkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1a2230',
  },
  linkText: { color: '#cbd5e1', fontWeight: '600' },
  primaryBtn: { backgroundColor: '#2563eb' },
  primaryText: { color: 'white' },
  searchRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#0b0f14',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#111827',
    color: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchBtnText: { color: 'white', fontWeight: '700' },
  tabBarWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#0b0f14',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  createScroll: { flex: 1, backgroundColor: '#0b0f14' },
  createScrollContent: { paddingBottom: 32 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  cardPrice: { color: '#86efac', fontWeight: '800' },
  cardMeta: { color: '#94a3b8', marginTop: 4 },
  cardDesc: { color: '#cbd5e1', marginTop: 6 },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  pill: {
    color: '#cbd5e1',
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  centerRow: { paddingHorizontal: 16, paddingVertical: 8 },
  error: { color: '#fda4af' },
  createBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 10,
  },
  createTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  createInput: {
    backgroundColor: '#0f172a',
    color: 'white',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  unitChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  unitChipText: {
    color: '#cbd5e1',
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
    color: '#fda4af',
    fontSize: 13,
  },
  createSuccess: {
    color: '#bbf7d0',
    fontSize: 13,
  },
  guestNotice: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  guestNoticeTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  guestNoticeText: {
    color: '#cbd5e1',
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
    borderColor: '#1f2937',
    backgroundColor: '#0f172a',
  },
  secondaryBtnText: {
    color: '#cbd5e1',
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
