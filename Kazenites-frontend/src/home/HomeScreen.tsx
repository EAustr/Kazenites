import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { API_BASE_URL } from '../config';
import type { Listing } from '../types';
import CreateListingSection from './CreateListingSection';

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
  const { token, user } = useContext(AuthContext);

  // Browse
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');

  const handleTabPress = (tab: 'browse' | 'create') => {
    setActiveTab(tab);
  };

  const fetchListings = async () => {
  setLoading(true);
  setError(null);
  try {
    const url =
      user?.role === 'ADMIN'
        ? `${API_BASE_URL}/api/listings?all=true${q ? `&q=${encodeURIComponent(q)}` : ''}`
        : q
        ? `${API_BASE_URL}/api/listings?q=${encodeURIComponent(q)}`
        : `${API_BASE_URL}/api/listings`;

    const res = await fetch(url, {
      headers: user?.role === 'ADMIN' && token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error(`Failed to load listings (${res.status})`);
    const json = await res.json();
    setItems(json);
  } catch (e: any) {
    setError(e.message || 'Failed to load');
  } finally {
    setLoading(false);
  }
};


  // Fetch pending listings (admins only)
const fetchPendingListings = async () => {
  if (!user || user.role !== 'ADMIN') return;
  if (!token) {
    console.warn('No token for fetchPendingListings');
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/listings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch pending listings (${res.status})`);
    const json = await res.json();
    setPendingListings(json);
  } catch (e: any) {
    console.error('fetchPendingListings error:', e);
  }
};

const fetchUsers = async () => {
  if (!user || user.role !== 'ADMIN') return;
  if (!token) {
    setUsersError('No token available');
    return;
  }
  setUsersLoading(true);
  setUsersError(null);
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
    const json = await res.json();
    setUsers(json);
  } catch (e: any) {
    setUsersError(e.message || 'Failed to load users');
  } finally {
    setUsersLoading(false);
  }
};

const handleApprove = async (id: number) => {
  if (!user || user.role !== 'ADMIN') return;
  if (!token) {
    console.warn('No token for approve');
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/listings/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Approve failed (${res.status})`);
    await fetchPendingListings();
    await fetchListings();
  } catch (e: any) {
    console.error('handleApprove error:', e);
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
      {item.city && <Text style={styles.cardMeta}>{item.city}</Text>}
      <Text style={styles.cardDesc} numberOfLines={2}>
        {item.description || ''}
      </Text>
      <View style={styles.pillRow}>
        {item.unit ? <Text style={styles.pill}>{item.unit}</Text> : null}
      </View>
    </View>
  );

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
          placeholderTextColor="#94a3b8"
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
      <Header
        isGuest={isGuest}
        user={user}
        onLoginPress={onLoginPress}
        onRegisterPress={onRegisterPress}
        onLogoutPress={onLogoutPress}
        onAdminPress={() => setShowAdmin(true)}
      />

      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'browse' && styles.tabButtonActive,
            ]}
            onPress={() => handleTabPress('browse')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'browse' && styles.tabButtonTextActive,
              ]}
            >
              Browse
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'create' && styles.tabButtonActive,
            ]}
            onPress={() => handleTabPress('create')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'create' && styles.tabButtonTextActive,
              ]}
            >
              Create
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'browse' ? (
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
      ) : isGuest ? (
        <ScrollView style={styles.createScroll} contentContainerStyle={styles.createScrollContent} keyboardShouldPersistTaps="handled">
          <GuestNotice onLoginPress={onLoginPress} onRegisterPress={onRegisterPress} />
        </ScrollView>
      ) : (
        <CreateListingSection
          isGuest={isGuest}
          onLoginPress={onLoginPress}
          onRegisterPress={onRegisterPress}
          onCreated={fetchListings}
        />
      )}

      {showAdmin && user?.role === 'ADMIN' && (
        <AdminPanel
          pendingListings={pendingListings}
          users={users}
          usersLoading={usersLoading}
          usersError={usersError}
          onApprove={handleApprove}
          onReject={handleReject}
          fetchUsers={fetchUsers}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  headerSafe: { backgroundColor: '#f8fafc' },
  header: {
    paddingTop: Platform.select({ ios: 12, android: 8 }),
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: '#0f172a', fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 8 },
  linkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  linkText: { color: '#1e293b', fontWeight: '600' },
  primaryBtn: { backgroundColor: '#2563eb' },
  primaryText: { color: 'white' },
  searchRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#f8fafc',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    backgroundColor: '#f8fafc',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
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
    color: '#475569',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },
  list: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  cardPrice: { color: '#2563eb', fontWeight: '800' },
  cardMeta: { color: '#64748b', marginTop: 4 },
  cardDesc: { color: '#475569', marginTop: 6 },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  pill: {
    color: '#475569',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  centerRow: { paddingHorizontal: 16, paddingVertical: 8 },
  error: { color: '#b91c1c' },
});
