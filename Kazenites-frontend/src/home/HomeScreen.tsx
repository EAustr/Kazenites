import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '../config';
import type { Listing, ListingUnit, User, Category } from '../types';
import { AuthContext } from '../auth/AuthContext';
import Header from '../home/Header';
import CreateListingSection from '../home/CreateListingSection';
import GuestNotice from '../home/Guest';
import AdminPanel from '../admin/AdminPanel';
import ListingImage from '../components/ListingImage';
import ListingDetailModal from '../components/ListingDetailModal';
import { styles } from '../styles';
import { Colors } from '../theme/colors';
import FilterMenu from './FilterMenu';
import SortMenu from './SortMenu';
import {
  applyFilterSort,
  uniqueCities,
  type ListingFilters,
  type SortOption,
} from '../utils/listingFilters';

type Props = {
  isGuest: boolean;
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  onLogoutPress?: () => void;
  onProfilePress?: () => void;
  onActiveListingsPress?: () => void;
};

export default function HomeScreen({
  isGuest,
  onLoginPress,
  onRegisterPress,
  onLogoutPress,
  onProfilePress,
  onActiveListingsPress,
}: Props) {
  const { token, user } = useContext(AuthContext);

  // Browse
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

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

  // Filters & sorting UI state
  const [filters, setFilters] = useState<ListingFilters>({});
  const [sort, setSort] = useState<SortOption>('NEWEST');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Listing detail modal
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Derived data
  const availableCities = useMemo(() => uniqueCities(items), [items]);
  const filteredItems = useMemo(
    () => applyFilterSort(items, filters, sort),
    [items, filters, sort],
  );

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query using current search + filters + sort (backend may ignore unknown params)
      const params: string[] = [];
      if (q) params.push(`q=${encodeURIComponent(q)}`);
      if (filters.categoryId != null)
        params.push(
          `categoryId=${encodeURIComponent(String(filters.categoryId))}`,
        );
      if (filters.city) params.push(`city=${encodeURIComponent(filters.city)}`);
      if (filters.priceMin != null)
        params.push(`minPrice=${encodeURIComponent(String(filters.priceMin))}`);
      if (filters.priceMax != null)
        params.push(`maxPrice=${encodeURIComponent(String(filters.priceMax))}`);
      if (filters.unit)
        params.push(`unit=${encodeURIComponent(String(filters.unit))}`);

      // sort mapping
      const sortMap: Record<string, { field: string; order: 'asc' | 'desc' }> =
        {
          PRICE_ASC: { field: 'price', order: 'asc' },
          PRICE_DESC: { field: 'price', order: 'desc' },
          TITLE_ASC: { field: 'title', order: 'asc' },
          TITLE_DESC: { field: 'title', order: 'desc' },
          NEWEST: { field: 'createdAt', order: 'desc' },
          OLDEST: { field: 'createdAt', order: 'asc' },
        };
      const s = sortMap[sort];
      if (s) {
        params.push(`sort=${encodeURIComponent(s.field)}`);
        params.push(`order=${encodeURIComponent(s.order)}`);
      }

      const base = `${API_BASE_URL}/api/listings`;
      const url =
        user?.role === 'ADMIN'
          ? `${base}?all=true${params.length ? `&${params.join('&')}` : ''}`
          : `${base}${params.length ? `?${params.join('&')}` : ''}`;

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

  // Fetch categories for filter options
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      if (!res.ok) throw new Error(`Failed to load categories (${res.status})`);
      const json = await res.json();
      setCategories(json);
    } catch (e) {
      // non-blocking for browsing
      console.warn('Failed to fetch categories');
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
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Not authorized (likely non-admin or expired token); don't spam console with errors
          return;
        }
        throw new Error(`Failed to fetch pending listings (${res.status})`);
      }
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

  const handleDeleteUser = async (id: number) => {
    if (!user || user.role !== 'ADMIN') return;
    if (!token) {
      console.warn('No token for delete user');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Delete user failed (${res.status})`);
      await fetchUsers(); // Refresh the users list
    } catch (e: any) {
      console.error('handleDeleteUser error:', e);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  useEffect(() => {
    refreshData();
    fetchCategories();
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
      <TouchableOpacity
        onPress={() => {
          setSelectedListing(item);
          setShowDetailModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.card}>
          {/* Image at the top if available */}
          <View style={styles.cardImageContainer}>
            <ListingImage
              key={`${item.id}-${refreshKey}`}
              listingId={item.id}
              width={80}
              height={80}
            />
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
                isPending && { backgroundColor: Colors.warning, color: '#000' },
              ]}
            >
              {item.status}
            </Text>
            {item.unit && <Text style={styles.pill}>{item.unit}</Text>}
          </View>
        </View>
      </TouchableOpacity>
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
        onActiveListingsPress={onActiveListingsPress}
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
              placeholderTextColor={Colors.textMuted}
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
          <View style={styles.filterSortRow}>
            <TouchableOpacity
              style={styles.smallIconBtn}
              onPress={() => setShowFilterMenu(true)}
            >
              <Text style={styles.smallIconBtnText}>Filters ▾</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallIconBtn}
              onPress={() => setShowSortMenu(true)}
            >
              <Text style={styles.smallIconBtnText}>Sort ▾</Text>
            </TouchableOpacity>
            {Boolean(
              filters.categoryId ||
                filters.city ||
                filters.priceMin != null ||
                filters.priceMax != null ||
                filters.unit,
            ) && (
              <TouchableOpacity
                style={[
                  styles.smallIconBtn,
                  { marginLeft: 'auto', backgroundColor: Colors.surfaceAlt },
                ]}
                onPress={() => setFilters({})}
              >
                <Text style={styles.smallIconBtnText}>Reset filters</Text>
              </TouchableOpacity>
            )}
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
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={x => String(x.id)}
            contentContainerStyle={styles.list}
            style={{ flex: 1 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
          <FilterMenu
            visible={showFilterMenu}
            onClose={() => setShowFilterMenu(false)}
            categories={categories}
            availableCities={availableCities}
            value={filters}
            onChange={setFilters}
            onReset={() => {
              setFilters({});
              setShowFilterMenu(false);
            }}
          />
          <SortMenu
            visible={showSortMenu}
            onClose={() => setShowSortMenu(false)}
            value={sort}
            onChange={setSort}
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
          onDeleteUser={handleDeleteUser}
          fetchUsers={fetchUsers}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {/* Listing Detail Modal */}
      <ListingDetailModal
        visible={showDetailModal}
        listing={selectedListing}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedListing(null);
        }}
        categories={categories}
      />
    </View>
  );
}
