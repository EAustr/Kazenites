import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config';
import type { Listing } from '../types';

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
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      {header}
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
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
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
});
