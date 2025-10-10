import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles';

type Props = {
  isGuest: boolean;
  user?: any; // or your User type
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  onLogoutPress?: () => void;
  onAdminPress?: () => void;
  onProfilePress?: () => void;
};

export default function Header({
  isGuest,
  user,
  onLoginPress,
  onRegisterPress,
  onLogoutPress,
  onAdminPress,
  onProfilePress,
}: Props) {
  return (
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
            <>
              {/* Profile button */}
              <TouchableOpacity style={styles.linkBtn} onPress={onProfilePress}>
                <Text style={styles.linkText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkBtn} onPress={onLogoutPress}>
                <Text style={styles.linkText}>Logout</Text>
              </TouchableOpacity>
              {user?.role === 'ADMIN' && (
                <TouchableOpacity
                  style={[styles.linkBtn, styles.primaryBtn]}
                  onPress={onAdminPress}
                >
                  <Text style={[styles.linkText, styles.primaryText]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
