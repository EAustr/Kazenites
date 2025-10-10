import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { AuthContext } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';
import { styles } from '../styles';
import type { User, Listing } from '../types';

type Props = {
  onBack?: () => void;
};

export default function ProfilePage({ onBack }: Props) {
  const { user: authUser, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'profile' | 'listings'>('profile');

  // Full user profile
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // User's listings
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser && token) {
      fetchUserProfile();
    }
  }, [authUser, token]);

  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.name);
      setEditSurname(userProfile.surname);
      setEditCity(userProfile.city || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchUserListings();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    if (!token) return;

    setProfileLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = await response.json();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use authUser as fallback
      setUserProfile({
        id: authUser!.id,
        email: authUser!.email,
        name: 'User',
        surname: '',
        role: authUser!.role,
        city: undefined,
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchUserListings = async () => {
    if (!token) return;

    setListingsLoading(true);
    setListingsError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/my-listings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const listings = await response.json();
      setUserListings(listings);
    } catch (error: any) {
      setListingsError(error.message || 'Failed to load your listings');
    } finally {
      setListingsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token || !userProfile) return;

    setEditLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          surname: editSurname.trim(),
          city: editCity.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setUserProfile(updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(userProfile?.name || '');
    setEditSurname(userProfile?.surname || '');
    setEditCity(userProfile?.city || '');
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#22c55e';
      case 'PENDING':
        return '#f59e0b';
      case 'REJECTED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderProfileTab = () => (
    <View style={profileStyles.profileContainer}>
      <View style={profileStyles.profileHeader}>
        <View style={profileStyles.avatarContainer}>
          <Text style={profileStyles.avatarText}>
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={profileStyles.userName}>
          {userProfile?.name} {userProfile?.surname}
        </Text>
        <Text style={profileStyles.userEmail}>{userProfile?.email}</Text>
        {userProfile?.role === 'ADMIN' && (
          <View style={profileStyles.adminBadge}>
            <Text style={profileStyles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>

      <View style={profileStyles.profileForm}>
        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>First Name</Text>
          {isEditing ? (
            <TextInput
              style={profileStyles.fieldInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter first name"
              placeholderTextColor="#6b7280"
            />
          ) : (
            <Text style={profileStyles.fieldValue}>
              {userProfile?.name || 'Not set'}
            </Text>
          )}
        </View>

        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>Last Name</Text>
          {isEditing ? (
            <TextInput
              style={profileStyles.fieldInput}
              value={editSurname}
              onChangeText={setEditSurname}
              placeholder="Enter last name"
              placeholderTextColor="#6b7280"
            />
          ) : (
            <Text style={profileStyles.fieldValue}>
              {userProfile?.surname || 'Not set'}
            </Text>
          )}
        </View>

        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>City</Text>
          {isEditing ? (
            <TextInput
              style={profileStyles.fieldInput}
              value={editCity}
              onChangeText={setEditCity}
              placeholder="Enter city (optional)"
              placeholderTextColor="#6b7280"
            />
          ) : (
            <Text style={profileStyles.fieldValue}>
              {userProfile?.city || 'Not set'}
            </Text>
          )}
        </View>

        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>Email</Text>
          <Text style={profileStyles.fieldValue}>{userProfile?.email}</Text>
          <Text style={profileStyles.fieldNote}>Email cannot be changed</Text>
        </View>
      </View>

      <View style={profileStyles.buttonContainer}>
        {isEditing ? (
          <View style={profileStyles.editButtons}>
            <TouchableOpacity
              style={[profileStyles.button, profileStyles.cancelButton]}
              onPress={handleCancelEdit}
              disabled={editLoading}
            >
              <Text style={profileStyles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[profileStyles.button, profileStyles.saveButton]}
              onPress={handleSaveProfile}
              disabled={editLoading}
            >
              {editLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={profileStyles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[profileStyles.button, profileStyles.editButton]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={profileStyles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderListingsTab = () => (
    <View style={profileStyles.listingsContainer}>
      {listingsLoading ? (
        <View style={profileStyles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={profileStyles.loadingText}>
            Loading your listings...
          </Text>
        </View>
      ) : listingsError ? (
        <View style={profileStyles.centerContainer}>
          <Text style={profileStyles.errorText}>{listingsError}</Text>
          <TouchableOpacity
            style={profileStyles.retryButton}
            onPress={fetchUserListings}
          >
            <Text style={profileStyles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : userListings.length === 0 ? (
        <View style={profileStyles.centerContainer}>
          <Text style={profileStyles.emptyText}>
            You haven't created any listings yet
          </Text>
        </View>
      ) : (
        <ScrollView style={profileStyles.listingsScroll}>
          {userListings.map(listing => (
            <View key={listing.id} style={profileStyles.listingCard}>
              <View style={profileStyles.listingHeader}>
                <Text style={profileStyles.listingTitle} numberOfLines={1}>
                  {listing.title}
                </Text>
                <View
                  style={[
                    profileStyles.statusBadge,
                    { backgroundColor: getStatusColor(listing.status) },
                  ]}
                >
                  <Text style={profileStyles.statusText}>{listing.status}</Text>
                </View>
              </View>
              <Text style={profileStyles.listingPrice}>
                €{listing.price.toFixed(2)}
              </Text>
              {listing.description && (
                <Text
                  style={profileStyles.listingDescription}
                  numberOfLines={2}
                >
                  {listing.description}
                </Text>
              )}
              <View style={profileStyles.listingMeta}>
                {listing.city && (
                  <Text style={profileStyles.listingMetaText}>
                    {listing.city}
                  </Text>
                )}
                {listing.unit && (
                  <Text style={profileStyles.listingMetaText}>
                    {listing.unit}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (!authUser) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={profileStyles.centerContainer}>
          <Text style={profileStyles.errorText}>
            Please log in to view your profile
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={profileStyles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={profileStyles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={profileStyles.header}>
        {onBack && (
          <TouchableOpacity style={profileStyles.backButton} onPress={onBack}>
            <Text style={profileStyles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={profileStyles.headerTitle}>Profile</Text>
        <View style={profileStyles.headerSpacer} />
      </View>

      <View style={profileStyles.tabBar}>
        <TouchableOpacity
          style={[
            profileStyles.tabButton,
            activeTab === 'profile' && profileStyles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('profile')}
        >
          <Text
            style={[
              profileStyles.tabButtonText,
              activeTab === 'profile' && profileStyles.tabButtonTextActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            profileStyles.tabButton,
            activeTab === 'listings' && profileStyles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('listings')}
        >
          <Text
            style={[
              profileStyles.tabButtonText,
              activeTab === 'listings' && profileStyles.tabButtonTextActive,
            ]}
          >
            My Listings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'profile' ? renderProfileTab() : renderListingsTab()}
    </SafeAreaView>
  );
}

const profileStyles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0b0f14',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: '#2563eb',
    fontWeight: '600' as const,
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700' as const,
  },
  headerSpacer: {
    width: 60,
  },
  tabBar: {
    flexDirection: 'row' as const,
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center' as const,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontWeight: '600' as const,
  },
  tabButtonTextActive: {
    color: 'white',
    fontWeight: '700' as const,
  },
  profileContainer: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700' as const,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  profileForm: {
    gap: 20,
    marginBottom: 32,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  fieldValue: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 8,
  },
  fieldInput: {
    backgroundColor: '#111827',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  fieldNote: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 'auto' as const,
  },
  editButtons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  editButton: {
    backgroundColor: '#2563eb',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600' as const,
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#d1d5db',
    fontWeight: '600' as const,
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#22c55e',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600' as const,
    fontSize: 16,
  },
  listingsContainer: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center' as const,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center' as const,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600' as const,
  },
  listingsScroll: {
    flex: 1,
  },
  listingCard: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  listingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  listingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  listingPrice: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  listingDescription: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  listingMeta: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  listingMetaText: {
    color: '#6b7280',
    fontSize: 12,
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
};
