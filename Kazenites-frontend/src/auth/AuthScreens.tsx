import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { AuthContext } from './AuthContext';

export function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const emailTrim = email.trim();
    if (!emailTrim || !password) {
      setError('Email and password are required');
      return;
    }
    if (!/.+@.+\..+/.test(emailTrim)) {
      setError('Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await login(emailTrim, password);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor={Colors.placeholder}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={Colors.placeholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        title={loading ? 'Signing in...' : 'Sign in'}
        onPress={onSubmit}
        disabled={loading}
      />
    </View>
  );
}

export function RegisterScreen() {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const nameTrim = name.trim();
    const surnameTrim = surname.trim();
    const emailTrim = email.trim();
    if (!nameTrim) return setError('Name is required');
    if (!surnameTrim) return setError('Surname is required');
    if (!emailTrim) return setError('Email is required');
    if (!/.+@.+\..+/.test(emailTrim)) return setError('Enter a valid email');
    if (password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(emailTrim, password, nameTrim, surnameTrim, city.trim() || undefined);
    } catch (e: any) {
      try {
        const obj = JSON.parse(e.message);
        const first = obj && typeof obj === 'object' ? Object.values(obj)[0] : null;
        if (typeof first === 'string') return setError(first);
      } catch {}
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        placeholder="Name"
        placeholderTextColor={Colors.placeholder}
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Surname"
        placeholderTextColor={Colors.placeholder}
        value={surname}
        onChangeText={setSurname}
        style={styles.input}
      />
      <TextInput
        placeholder="City (optional)"
        placeholderTextColor={Colors.placeholder}
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        placeholderTextColor={Colors.placeholder}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={Colors.placeholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        title={loading ? 'Creating account...' : 'Create account'}
        onPress={onSubmit}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  error: { color: Colors.error },
});
