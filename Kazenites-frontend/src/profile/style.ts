import { StyleSheet } from "react-native";

export const profileStyles = StyleSheet.create({
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0b0f14',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: '#2563eb',
    fontWeight: '600' as const,
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700' as const,
  },
  headerSpacer: {
    width: 60,
  },
  tabBar: {
    flexDirection: 'row' as const,
    backgroundColor: '#111827',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center' as const,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#2563eb',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontWeight: '600' as const,
  },
  tabButtonTextActive: {
    color: 'white',
    fontWeight: '700' as const,
  },
  profileContainer: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700' as const,
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  profileForm: {
    gap: 20,
    marginBottom: 32,
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  fieldValue: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 8,
  },
  fieldInput: {
    backgroundColor: '#111827',
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  fieldNote: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  buttonContainer: {
    marginTop: 'auto' as const,
  },
  editButtons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  editButton: {
    backgroundColor: '#2563eb',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600' as const,
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#d1d5db',
    fontWeight: '600' as const,
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#22c55e',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600' as const,
    fontSize: 16,
  },
  listingsContainer: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 16,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center' as const,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center' as const,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600' as const,
  },
  listingsScroll: {
    flex: 1,
  },
  listingCard: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  listingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  listingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  listingPrice: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  listingDescription: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  listingMeta: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  listingMetaText: {
    color: '#6b7280',
    fontSize: 12,
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
});