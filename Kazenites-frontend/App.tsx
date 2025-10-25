/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useMemo, useState, useContext } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Button,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Colors } from './src/theme/colors';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, AuthContext } from './src/auth/AuthContext';
import { LoginScreen, RegisterScreen } from './src/auth/AuthScreens';
import HomeScreen from './src/home/HomeScreen';
import ProfilePage from './src/profile/profilePage';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        translucent={false}
        backgroundColor={Colors.background}
      />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { user, logout } = useContext(AuthContext);
  const [authView, setAuthView] = useState<null | 'login' | 'register'>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'profile' | 'listings'>('profile');

  if (!user) {
    if (authView === 'login' || authView === 'register') {
      return (
        <SafeAreaView
          edges={['top']}
          style={{ flex: 1, backgroundColor: Colors.background }}
        >
          <View
            style={{
              backgroundColor: Colors.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => setAuthView(null)}
              style={{ paddingVertical: 6, paddingRight: 12 }}
            >
              <Text style={{ color: Colors.primary, fontWeight: '600' }}>Back</Text>
            </TouchableOpacity>
            <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700' }}>
              {authView === 'login' ? 'Login' : 'Register'}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: Colors.background }}>
            {authView === 'login' ? <LoginScreen /> : <RegisterScreen />}
          </View>
        </SafeAreaView>
      );
    }
    return (
      <HomeScreen
        isGuest
        onLoginPress={() => setAuthView('login')}
        onRegisterPress={() => setAuthView('register')}
      />
    );
  }

  // Show profile page if requested
  if (showProfile) {
    return (
      <ProfilePage
        onBack={() => setShowProfile(false)}
        initialTab={profileInitialTab}
      />
    );
  }

  return (
    <HomeScreen
      isGuest={false}
      onLogoutPress={logout}
      onProfilePress={() => {
        setProfileInitialTab('profile');
        setShowProfile(true);
      }}
      onActiveListingsPress={() => {
        setProfileInitialTab('listings');
        setShowProfile(true);
      }}
    />
  );
}

function AppContent({ onLogout }: { onLogout: () => void }) {
  // NOTE: Adjust BASE_URL depending on where your backend runs.
  // - iOS simulator can use http://localhost:8080
  // - Android emulator use http://10.0.2.2:8080
  // - Physical device use your computer's LAN IP, e.g. http://192.168.1.10:8080
  const BASE_URL = useMemo(() => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    return 'http://localhost:8080';
  }, []);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ping = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e: any) {
      setError(e?.message ?? 'Request failed');
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kazenites</Text>
      <Text style={styles.subtitle}>Welcome. You are logged in.</Text>
      <View style={styles.row}>
        <Button title="Ping backend" onPress={ping} />
        <Button title="Logout" onPress={onLogout} />
      </View>
      {loading && (
        <View style={styles.row}>
          <ActivityIndicator />
          <Text style={styles.info}> Contacting {BASE_URL}/api/health ...</Text>
        </View>
      )}
      {result && (
        <View style={styles.block}>
          <Text style={styles.code}>{result}</Text>
        </View>
      )}
      {error && (
        <View style={styles.block}>
          <Text style={styles.error}>Error: {error}</Text>
        </View>
      )}
      <View style={styles.noteBlock}>
        <Text style={styles.note}>
          Tip: Update BASE_URL in src/config.ts as needed.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.text,
  },
  subtitle: { fontSize: 16, textAlign: 'center', color: Colors.textSubtle },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  block: {
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    width: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteBlock: { paddingTop: 12 },
  note: { fontSize: 12, textAlign: 'center', color: Colors.textMuted },
  info: { marginLeft: 8, textAlign: 'center', color: Colors.textSubtle },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    textAlign: 'center',
  },
  error: { color: Colors.error, textAlign: 'center' },
});

export default App;
