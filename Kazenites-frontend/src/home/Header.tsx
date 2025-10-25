import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles';
import ProfileMenu from './ProfileMenu';
import { AuthContext } from '../auth/AuthContext';
import { API_BASE_URL } from '../config';
import { Colors } from '../theme/colors';

type Props = {
  isGuest: boolean;
  user?: any; // or your User type
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  onLogoutPress?: () => void;
  onAdminPress?: () => void;
  onProfilePress?: () => void;
  onActiveListingsPress?: () => void;
};

export default function Header({
  isGuest,
  user,
  onLoginPress,
  onRegisterPress,
  onLogoutPress,
  onAdminPress,
  onProfilePress,
  onActiveListingsPress,
}: Props) {
  const { token } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<{ name?: string; surname?: string; email?: string; avatarPath?: string | null } | null>(null);
  const fullName = useMemo(() => {
    const name = profile?.name ?? user?.name ?? '';
    const surname = profile?.surname ?? user?.surname ?? '';
    return `${name} ${surname}`.trim();
  }, [user, profile]);

  // Fetch full profile when opening menu (and logged in)
  useEffect(() => {
    if (!isGuest && menuOpen && token && !profile) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            setProfile(json);
          }
        } catch (e) {
          // noop
        }
      })();
    }
  }, [isGuest, menuOpen, token, profile]);

  return (
    <SafeAreaView edges={['top']} style={styles.headerSafe}>
      <View style={styles.header}>
        <Text style={styles.brand}>Kazenites</Text>
        <View style={styles.headerActions}>
          {/* Right side: Avatar circle for both guests and users */}
          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: Colors.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: Colors.text, fontWeight: '700' }}>
              {fullName?.charAt(0)?.toUpperCase() || (user?.email?.charAt(0)?.toUpperCase() ?? (isGuest ? 'G' : 'U'))}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ProfileMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        isGuest={!!isGuest}
        fullName={fullName}
        email={profile?.email || user?.email}
        avatarUrl={profile?.avatarPath || user?.avatarPath}
        isAdmin={user?.role === 'ADMIN'}
        onOpenProfile={onProfilePress}
        onOpenActiveListings={onActiveListingsPress}
        onOpenAdmin={onAdminPress}
        onLogin={onLoginPress}
        onRegister={onRegisterPress}
        onLogout={onLogoutPress}
      />
    </SafeAreaView>
  );
}
