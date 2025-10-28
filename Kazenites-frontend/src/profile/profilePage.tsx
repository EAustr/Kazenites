import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';
import { styles } from '../styles';
import type { User, Listing } from '../types';
import { profileStyles } from './style';
import CreateListingSection from '../home/CreateListingSection.tsx';
import type { Listing as ListingType } from '../types';
import { Colors } from '../theme/colors';

type Props = {
  onBack?: () => void;
  initialTab?: 'profile' | 'listings';
};

export default function ProfilePage({ onBack, initialTab = 'profile' }: Props) {
  const { user: authUser, token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'profile' | 'listings'>(
    initialTab,
  );

  // Full user profile
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // User's listings
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      setEditPhoneNumber(userProfile.phoneNumber || '');
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
        if (response.status === 401 || response.status === 403) {
          // Not authorized (token issue); fallback to authUser
          throw new Error('unauthorized');
        }
        throw new Error('Failed to fetch profile');
      }

      const profile = await response.json();
      setUserProfile(profile);
    } catch (error) {
      // Avoid red error overlay in dev for expected auth errors
      console.warn(
        'Error fetching profile (fallback to authUser):',
        (error as any)?.message,
      );
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
          phoneNumber: editPhoneNumber.trim() || null,
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

  const handleUploadAvatar = async () => {
    if (!token) return;
    // For now, this is a placeholder using a pre-known file URI. In a real app,
    // integrate react-native-image-picker or expo-image-picker to get an image file.
    // TODO: Replace with image picker
    try {
      // @ts-ignore
      const pickedUri: string | undefined = undefined;
      if (!pickedUri) {
        Alert.alert('Info', 'Image picker not implemented yet');
        return;
      }
      const form = new FormData();
      // @ts-ignore
      form.append('file', {
        uri: pickedUri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      });
      const res = await fetch(`${API_BASE_URL}/api/users/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      } as any);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Upload failed (${res.status})`);
      }
      await fetchUserProfile();
      Alert.alert('Updated', 'Avatar updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to upload avatar');
    }
  };

  const handleCancelEdit = () => {
    setEditName(userProfile?.name || '');
    setEditSurname(userProfile?.surname || '');
    setEditCity(userProfile?.city || '');
    setEditPhoneNumber(userProfile?.phoneNumber || '');
    setIsEditing(false);
  };

  const handlePhoneNumberChange = (text: string) => {
    // Only allow numbers, spaces, +, -, (, and )
    const filtered = text.replace(/[^0-9+\-() ]/g, '');
    setEditPhoneNumber(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return Colors.success;
      case 'PENDING':
        return Colors.warning;
      case 'REJECTED':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setEditModalVisible(true);
  };

  const handleDeleteListing = (id: number) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            setActionLoading(true);
            try {
              const res = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || `Delete failed (${res.status})`);
              }
              // refresh listings
              await fetchUserListings();
              Alert.alert('Deleted', 'Listing removed.');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Failed to delete listing');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleRepublishListing = (id: number) => {
    Alert.alert(
      'Republish listing',
      'Republish this rejected listing for review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Republish',
          onPress: async () => {
            if (!token) return;
            setActionLoading(true);
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/listings/${id}/republish`,
                {
                  method: 'PUT',
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || `Republish failed (${res.status})`);
              }
              await fetchUserListings();
              Alert.alert('Success', 'Listing resubmitted for approval.');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Failed to republish listing');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const renderProfileTab = () => (
    <ScrollView style={profileStyles.profileContainer}>
      <View style={profileStyles.profileHeader}>
        <View style={profileStyles.avatarContainer}>
          {userProfile?.avatarPath ? (
            // eslint-disable-next-line react/no-unstable-nested-components
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                overflow: 'hidden',
                backgroundColor: Colors.surfaceAlt,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Use Image component when imported; kept simple to avoid new imports here */}
              <Text style={profileStyles.avatarText}>IMG</Text>
            </View>
          ) : (
            <Text style={profileStyles.avatarText}>
              {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          )}
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
        <TouchableOpacity onPress={handleUploadAvatar} style={{ marginTop: 8 }}>
          <Text style={{ color: Colors.primary, fontWeight: '600' }}>
            Change photo
          </Text>
        </TouchableOpacity>
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
              placeholderTextColor={Colors.placeholder}
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
              placeholderTextColor={Colors.placeholder}
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
              placeholderTextColor={Colors.placeholder}
            />
          ) : (
            <Text style={profileStyles.fieldValue}>
              {userProfile?.city || 'Not set'}
            </Text>
          )}
        </View>

        <View style={profileStyles.fieldContainer}>
          <Text style={profileStyles.fieldLabel}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={profileStyles.fieldInput}
              value={editPhoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder="Enter phone number (optional)"
              placeholderTextColor={Colors.placeholder}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={profileStyles.fieldValue}>
              {userProfile?.phoneNumber || 'Not set'}
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
                <ActivityIndicator color={Colors.text} size="small" />
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
    </ScrollView>
  );

  const renderListingsTab = () => (
    <View style={profileStyles.listingsContainer}>
      {listingsLoading ? (
        <View style={profileStyles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
              {(listing.status === 'REJECTED' ||
                listing.status === 'APPROVED') && (
                <View style={profileStyles.listingActions}>
                  <TouchableOpacity
                    style={[profileStyles.actionButton, profileStyles.editBtn]}
                    onPress={() => handleEditListing(listing)}
                    disabled={actionLoading}
                  >
                    <Text style={profileStyles.actionText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      profileStyles.actionButton,
                      profileStyles.deleteBtn,
                    ]}
                    onPress={() => handleDeleteListing(listing.id)}
                    disabled={actionLoading}
                  >
                    <Text style={profileStyles.actionText}>Delete</Text>
                  </TouchableOpacity>

                  {listing.status === 'REJECTED' && (
                    <TouchableOpacity
                      style={[
                        profileStyles.actionButton,
                        profileStyles.republishBtn,
                      ]}
                      onPress={() => handleRepublishListing(listing.id)}
                      disabled={actionLoading}
                    >
                      <Text style={profileStyles.actionText}>Republish</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  if (!authUser) {
    return (
      <SafeAreaView edges={['top']} style={styles.screen}>
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
      <SafeAreaView edges={['top']} style={styles.screen}>
        <View style={profileStyles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={profileStyles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
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
      <Modal
        visible={editModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setEditModalVisible(false);
          setEditingListing(null);
        }}
      >
        <SafeAreaView style={styles.screen}>
          <View style={{ flex: 1 }}>
            <View style={profileStyles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingListing(null);
                }}
              >
                <Text style={profileStyles.modalClose}>Close</Text>
              </TouchableOpacity>
              <Text style={profileStyles.modalTitle}>Edit listing</Text>
              <View style={{ width: 48 }} />
            </View>

            <CreateListingSection
              isGuest={false}
              existingListing={editingListing ?? undefined}
              mode="edit"
              onCreated={async () => {
                await fetchUserListings();
                setEditModalVisible(false);
                setEditingListing(null);
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
