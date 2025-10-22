import { StyleSheet } from "react-native";
import { Colors } from "../theme/colors";

export const profileStyles = StyleSheet.create({
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backButtonText: {
    color: Colors.primary,
    fontWeight: '600' as const,
    fontSize: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  headerSpacer: {
    width: 60,
  },
  tabBar: {
    flexDirection: 'row' as const,
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  tabButtonTextActive: {
    color: Colors.text,
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
    backgroundColor: Colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  avatarText: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '700' as const,
  },
  userName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  userEmail: {
    color: Colors.textMuted,
    fontSize: 16,
    marginBottom: 8,
  },
  adminBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadgeText: {
    color: Colors.text,
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
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  fieldValue: {
    color: Colors.text,
    fontSize: 16,
    paddingVertical: 8,
  },
  fieldInput: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldNote: {
    color: Colors.textMuted,
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
    backgroundColor: Colors.primary,
  },
  editButtonText: {
    color: Colors.text,
    fontWeight: '600' as const,
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
  },
  cancelButtonText: {
    color: Colors.textSubtle,
    fontWeight: '600' as const,
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.success,
  },
  saveButtonText: {
    color: Colors.text,
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
    color: Colors.textMuted,
    fontSize: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center' as const,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: 'center' as const,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.text,
    fontWeight: '600' as const,
  },
  listingsScroll: {
    flex: 1,
  },
  listingCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  listingTitle: {
    color: Colors.text,
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
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  listingPrice: {
    color: Colors.success,
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  listingDescription: {
    color: Colors.textSubtle,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  listingMeta: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  listingMetaText: {
    color: Colors.textMuted,
    fontSize: 12,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  listingActions: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 8,
},
actionButton: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 10,
  marginRight: 8,
},
editBtn: {
  backgroundColor: Colors.primary,
},
deleteBtn: {
  backgroundColor: Colors.error,
},
republishBtn: {
  backgroundColor: Colors.success,
},
actionText: {
  color: Colors.text,
  fontWeight: '600',
},
modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: Colors.border,
},
modalClose: {
  color: Colors.primary,
  fontWeight: '700',
},
modalTitle: {
  fontWeight: '700',
  fontSize: 16,
},

});
