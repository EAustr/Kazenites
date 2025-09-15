/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
  Button,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
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
      <Text style={styles.subtitle}>Backend health check</Text>
      <View style={styles.row}>
        <Button title="Ping backend" onPress={ping} />
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
          Tip: Update BASE_URL in App.tsx if you run on a device or different
          host.
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
