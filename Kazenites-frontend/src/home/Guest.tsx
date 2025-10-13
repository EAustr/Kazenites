import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles'; 

type Props = {
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
};

export default function GuestNotice({ onLoginPress, onRegisterPress }: Props) {
  return (
    <View style={styles.guestNotice}>
      <Text style={styles.guestNoticeTitle}>Sign in to create listings</Text>
      <Text style={styles.guestNoticeText}>
        Only registered users can create listings. Please log in or register to continue.
      </Text>
      <View style={styles.guestActions}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onLoginPress}>
          <Text style={styles.secondaryBtnText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, styles.secondaryBtnPrimary]}
          onPress={onRegisterPress}
        >
          <Text style={styles.secondaryBtnPrimaryText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
