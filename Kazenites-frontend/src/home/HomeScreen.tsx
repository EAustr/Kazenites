import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { API_BASE_URL } from '../config';
import type { Listing, ListingUnit, User } from '../types';
import { AuthContext } from '../auth/AuthContext';
import Header from '../home/Header';
import CreateListingSection from '../home/CreateListingSection';
import GuestNotice from '../home/Guest';
import AdminPanel from '../admin/AdminPanel';
import ListingImage from '../components/ListingImage';
import { styles } from '../styles';

type Props = {
  isGuest: boolean;
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  onLogoutPress?: () => void;
  onProfilePress?: () => void;
};

export default function HomeScreen({
  isGuest,
  onLoginPress,
  onRegisterPress,
  onLogoutPress,
  onProfilePress,
}: Props) {
  const { token, user } = useContext(AuthContext);

  // Browse
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Listing[]>([]);

  // Tabs
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');

  // Refresh key to force component updates
  const [refreshKey, setRefreshKey] = useState(0);

  // Admin Panel
  const [showAdmin, setShowAdmin] = useState(false);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        user?.role === 'ADMIN'
          ? `${API_BASE_URL}/api/listings?all=true${
              q ? `&q=${encodeURIComponent(q)}` : ''
            }`
          : q
          ? `${API_BASE_URL}/api/listings?q=${encodeURIComponent(q)}`
          : `${API_BASE_URL}/api/listings`;

      const res = await fetch(url, {
        headers:
          user?.role === 'ADMIN' && token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
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
      if (!res.ok)
        throw new Error(`Failed to fetch pending listings (${res.status})`);
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

  // Combined refresh function that updates both data and forces component refresh
  const refreshData = async () => {
    await fetchListings();
    await fetchPendingListings();
    setRefreshKey(prev => prev + 1); // Force ListingImage components to refresh
  };

  const handleApprove = async (id: number) => {
    if (!user || user.role !== 'ADMIN') return;
    if (!token) {
      console.warn('No token for approve');
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/listings/${id}/approve`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error(`Approve failed (${res.status})`);
      await refreshData();
    } catch (e: any) {
      console.error('handleApprove error:', e);
    }
  };

  const handleReject = async (id: number) => {
    if (!user || user.role !== 'ADMIN') return;
    if (!token) {
      console.warn('No token for reject');
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/listings/${id}/reject`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error(`Reject failed (${res.status})`);
      await refreshData();
    } catch (e: any) {
      console.error('handleReject error:', e);
    }
  };

  useEffect(() => {
    refreshData();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleTabPress = async (tab: 'browse' | 'create') => {
    setActiveTab(tab);
    // Refresh data when switching to browse tab
    if (tab === 'browse') {
      await refreshData();
    }
  };

  const renderItem = ({ item }: { item: Listing }) => {
    const isPending = item.status === 'PENDING' && user?.role === 'ADMIN';

    return (
      <View style={styles.card}>
        {/* Image at the top if available */}
        <View style={styles.cardImageContainer}>
          <ListingImage key={`${item.id}-${refreshKey}`} listingId={item.id} width={80} height={80} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardPrice}>€{item.price.toFixed(2)}</Text>
            </View>
            {item.city && <Text style={styles.cardMeta}>{item.city}</Text>}
          </View>
        </View>
        
        <Text style={styles.cardDesc} numberOfLines={3}>
          {item.description || 'No description provided'}
        </Text>
        
        <View style={styles.pillRow}>
          <Text
            style={[
              styles.pill,
              isPending && { backgroundColor: '#fbbf24', color: '#000' },
            ]}
          >
            {item.status}
          </Text>
          {item.unit && <Text style={styles.pill}>{item.unit}</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <Header
        isGuest={isGuest}
        user={user}
        onLoginPress={onLoginPress}
        onRegisterPress={onRegisterPress}
        onLogoutPress={onLogoutPress}
        onAdminPress={() => setShowAdmin(true)}
        onProfilePress={onProfilePress}
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
              placeholderTextColor="#94a3b8"
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
        <ScrollView
          style={styles.createScroll}
          contentContainerStyle={styles.createScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <GuestNotice
            onLoginPress={onLoginPress}
            onRegisterPress={onRegisterPress}
          />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.createScroll}
          contentContainerStyle={styles.createScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <CreateListingSection
            isGuest={isGuest}
            onLoginPress={onLoginPress}
            onRegisterPress={onRegisterPress}
            onCreated={refreshData}
          />
        </ScrollView>
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
