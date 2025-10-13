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
import { profileStyles } from './style';

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
