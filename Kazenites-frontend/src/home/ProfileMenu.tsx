import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from '../styles';
import { Colors } from '../theme/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  isGuest: boolean;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  onOpenProfile?: () => void;
  onOpenActiveListings?: () => void;
  onOpenAdmin?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
};

export default function ProfileMenu({
  visible,
  onClose,
  isGuest,
  fullName,
  email,
  avatarUrl,
  isAdmin,
  onOpenProfile,
  onOpenActiveListings,
  onOpenAdmin,
  onLogin,
  onRegister,
  onLogout,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.profileMenuBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.profileMenuSheet}>
          {!isGuest ? (
            <>
              <View style={styles.profileMenuHeaderRow}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.profileMenuAvatar} />
                ) : (
                  <View style={[styles.profileMenuAvatar, styles.profileMenuAvatarFallback]}>
                    <Text style={styles.profileMenuAvatarText}>
                      {fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileMenuName}>{fullName}</Text>
                  {!!email && <Text style={styles.profileMenuEmail}>{email}</Text>}
                </View>
              </View>

              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  onClose();
                  onOpenProfile && onOpenProfile();
                }}
              >
                <Text style={styles.profileMenuItemText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  onClose();
                  onOpenActiveListings && onOpenActiveListings();
                }}
              >
                <Text style={styles.profileMenuItemText}>My Active Listings</Text>
              </TouchableOpacity>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.profileMenuItem}
                  onPress={() => {
                    onClose();
                    onOpenAdmin && onOpenAdmin();
                  }}
                >
                  <Text style={styles.profileMenuItemText}>Admin Panel</Text>
                </TouchableOpacity>
              )}
              <View style={styles.profileMenuSeparator} />
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  onClose();
                  onLogout && onLogout();
                }}
              >
                <Text style={[styles.profileMenuItemText, { color: Colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.profileMenuName, { marginBottom: 8 }]}>Welcome</Text>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  onClose();
                  onLogin && onLogin();
                }}
              >
                <Text style={styles.profileMenuItemText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  onClose();
                  onRegister && onRegister();
                }}
              >
                <Text style={styles.profileMenuItemText}>Register</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
