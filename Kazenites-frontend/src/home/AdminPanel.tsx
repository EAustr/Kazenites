import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Listing } from '../types';
import { styles } from '../styles';
import type { User } from '../types';

type Props = {
  pendingListings: Listing[];
  users: User[];
  usersLoading: boolean;
  usersError: string | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  fetchUsers: () => void;
  onClose: () => void;
};

export default function AdminPanel({
  pendingListings,
  users,
  usersLoading,
  usersError,
  onApprove,
  onReject,
  fetchUsers,
  onClose,
}: Props) {
  const [adminTab, setAdminTab] = useState<'listings' | 'users'>('listings');

  return (
    <View style={styles.adminPanel}>
      <Text style={styles.adminTitle}>Admin Panel</Text>

      {/* Tabs */}
      <View style={styles.adminTabBar}>
        <TouchableOpacity
          style={[styles.adminTabBtn, adminTab === 'listings' && styles.adminTabBtnActive]}
          onPress={() => setAdminTab('listings')}
        >
          <Text style={adminTab === 'listings' ? styles.adminTabTextActive : styles.adminTabText}>
            Listings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.adminTabBtn, adminTab === 'users' && styles.adminTabBtnActive]}
          onPress={() => {
            setAdminTab('users');
            fetchUsers();
          }}
        >
          <Text style={adminTab === 'users' ? styles.adminTabTextActive : styles.adminTabText}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {/* Listings Tab */}
      {adminTab === 'listings' && (
        <FlatList
          data={pendingListings}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.linkBtn, { backgroundColor: 'green', marginRight: 8 }]}
                  onPress={() => onApprove(item.id)}
                >
                  <Text style={{ color: 'white' }}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.linkBtn, { backgroundColor: 'red' }]}
                  onPress={() => onReject(item.id)}
                >
                  <Text style={{ color: 'white' }}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* Users Tab */}
      {adminTab === 'users' && (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.email}</Text>
              <Text style={styles.cardMeta}>
                {item.name} {item.surname} – {item.role}
              </Text>
              {item.city ? <Text style={styles.cardMeta}>{item.city}</Text> : null}
            </View>
          )}
          ListEmptyComponent={
            usersLoading ? (
              <ActivityIndicator />
            ) : usersError ? (
              <Text style={styles.error}>{usersError}</Text>
            ) : (
              <Text style={styles.cardMeta}>No users found</Text>
            )
          }
        />
      )}

      {/* Close Button */}
      <TouchableOpacity
        style={[styles.linkBtn, { marginTop: 12, alignSelf: 'center' }]}
        onPress={onClose}
      >
        <Text style={{ color: 'white' }}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}
