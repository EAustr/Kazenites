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
  useColorScheme,
  View,
  Text,
  Button,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, AuthContext } from './src/auth/AuthContext';
import { LoginScreen, RegisterScreen } from './src/auth/AuthScreens';
import HomeScreen from './src/home/HomeScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent={false}
        backgroundColor="#0b0f14"
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

  if (!user) {
    if (authView === 'login' || authView === 'register') {
      return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#0b0f14' }}>
          <View style={{ backgroundColor: '#0b0f14', paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setAuthView(null)} style={{ paddingVertical: 6, paddingRight: 12 }}>
              <Text style={{ color: '#93c5fd', fontWeight: '600' }}>Back</Text>
            </TouchableOpacity>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
              {authView === 'login' ? 'Login' : 'Register'}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white' }}>
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

  return <HomeScreen isGuest={false} onLogoutPress={logout} />;
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
  },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 16, opacity: 0.8, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  block: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    width: '90%',
  },
  noteBlock: { paddingTop: 12 },
  note: { fontSize: 12, opacity: 0.6, textAlign: 'center' },
  info: { marginLeft: 8, textAlign: 'center' },
  code: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 12,
    textAlign: 'center',
  },
  error: { color: '#b00020', textAlign: 'center' },
});

export default App;
