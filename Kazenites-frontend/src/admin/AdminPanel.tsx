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
import { Colors } from '../theme/colors';

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

              {item.description ? (
                <Text style={styles.cardDesc}>{item.description}</Text>
              ) : null}

              <View style={{ marginTop: 6 }}>
                <Text style={styles.cardMeta}>
                   Price: {item.price} / {item.unit || 'unit'}
                </Text>
                {item.quantity ? (
                  <Text style={styles.cardMeta}> Quantity: {item.quantity}</Text>
                ) : null}
                {item.city ? (
                  <Text style={styles.cardMeta}> City: {item.city}</Text>
                ) : null}
                <Text style={styles.cardMeta}> Category ID: {item.categoryId}</Text>
                <Text style={styles.cardMeta}>
                 Created: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown'}
                </Text>
              </View>

              {/* Approve/Reject Buttons */}
              <View style={{ flexDirection: 'row', marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.linkBtn, { backgroundColor: Colors.success, marginRight: 8 }]}
                  onPress={() => onApprove(item.id)}
                >
                  <Text style={{ color: Colors.text }}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.linkBtn, { backgroundColor: Colors.error }]}
                  onPress={() => onReject(item.id)}
                >
                  <Text style={{ color: Colors.text }}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.cardMeta}>No pending listings</Text>
          }
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
        <Text style={{ color: Colors.text }}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}
