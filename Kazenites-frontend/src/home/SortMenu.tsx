import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import type { SortOption } from '../utils/listingFilters';

type Props = {
  visible: boolean;
  onClose: () => void;
  value: SortOption;
  onChange: (next: SortOption) => void;
};

const OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'NEWEST', label: 'Newest first' },
  { key: 'OLDEST', label: 'Oldest first' },
  { key: 'PRICE_ASC', label: 'Price: Low to High' },
  { key: 'PRICE_DESC', label: 'Price: High to Low' },
  { key: 'TITLE_ASC', label: 'Title: A → Z' },
  { key: 'TITLE_DESC', label: 'Title: Z → A' },
];

export default function SortMenu({ visible, onClose, value, onChange }: Props) {
  const [local, setLocal] = useState<SortOption>(value);

  useEffect(() => {
    setLocal(value);
  }, [value, visible]);

  const apply = () => {
    onChange(local);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Sort by</Text>

          {OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.option, local === opt.key && styles.optionActive]}
              onPress={() => setLocal(opt.key)}
            >
              <Text style={styles.optionText}>
                {local === opt.key ? '✓ ' : ''}
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose}>
              <Text style={styles.btnGhostText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={apply}>
              <Text style={styles.btnPrimaryText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  sheet: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: { color: Colors.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
  option: {
    backgroundColor: Colors.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  optionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionText: { color: Colors.textSubtle, fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginLeft: 8 },
  btnGhost: { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  btnGhostText: { color: Colors.textSubtle, fontWeight: '600' },
  btnPrimary: { backgroundColor: Colors.primary },
  btnPrimaryText: { color: Colors.text, fontWeight: '700' },
});
