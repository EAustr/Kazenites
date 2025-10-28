import React, { useState, useContext, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import type {
  Listing,
  User,
  Category,
  ListingImage as ListingImageType,
} from '../types';
import { API_BASE_URL } from '../config';
import { AuthContext } from '../auth/AuthContext';
import ListingImage from './ListingImage';

type Props = {
  visible: boolean;
  listing: Listing | null;
  onClose: () => void;
  categories: Category[];
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ListingDetailModal({
  visible,
  listing,
  onClose,
  categories,
}: Props) {
  const { token, user } = useContext(AuthContext);
  const [seller, setSeller] = useState<User | null>(null);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [listingImages, setListingImages] = useState<ListingImageType[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (listing && visible) {
      fetchSellerInfo();
      fetchListingImages();
      setCurrentImageIndex(0);
    }
  }, [listing?.id, visible]);

  const fetchListingImages = async () => {
    if (!listing) return;

    console.log('Fetching images for listing:', listing.id);
    setLoadingImages(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/listings/${listing.id}/images`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      console.log('Image fetch response status:', response.status);
      if (response.ok) {
        const imageData = await response.json();
        console.log('Fetched images:', imageData);
        setListingImages(imageData);
      }
    } catch (error) {
      console.error('Failed to fetch listing images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const fetchSellerInfo = async () => {
    if (!listing) return;

    console.log('Fetching seller info for user:', listing.ownerId);
    setLoadingSeller(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/${listing.ownerId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      console.log('Seller fetch response status:', response.status);
      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched seller:', userData);
        setSeller(userData);
      }
    } catch (error) {
      console.error('Failed to fetch seller info:', error);
    } finally {
      setLoadingSeller(false);
    }
  };

  const handleContactSeller = () => {
    if (!seller) return;

    Alert.alert('Contact Seller', `Would you like to contact ${seller.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Email',
        onPress: () => {
          Linking.openURL(
            `mailto:${seller.email}?subject=Regarding: ${listing?.title}`,
          );
        },
      },
    ]);
  };

  const getCategoryName = () => {
    if (!listing) return 'Unknown';
    const category = categories.find(c => c.id === listing.categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryEmoji = () => {
    if (!listing) return '🍓';
    const category = categories.find(c => c.id === listing.categoryId);
    const categoryName = category?.name.toLowerCase() || '';
    
    // Map category names to emojis
    if (categoryName.includes('zemenes') || categoryName.includes('strawberr')) return '🍓';
    if (categoryName.includes('mellenes') || categoryName.includes('blueberr')) return '🫐';
    if (categoryName.includes('avenes') || categoryName.includes('raspberr')) return '🍇';
    if (categoryName.includes('kazenes') || categoryName.includes('blackberr')) return '🫐';
    
    return '🍓'; // default fallback
  };

  if (!listing) return null;

  const hasImages = listingImages.length > 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={[]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {listing.title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <View style={styles.imageSection}>
            {loadingImages ? (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>⏳</Text>
                <Text style={styles.noImageLabel}>Loading images...</Text>
              </View>
            ) : hasImages ? (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={e => {
                    const index = Math.round(
                      e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                    );
                    setCurrentImageIndex(index);
                  }}
                  scrollEventThrottle={16}
                >
                  {listingImages.map((img, index) => (
                    <View key={img.id} style={styles.imageContainer}>
                      <Image
                        source={{
                          uri: img.path.startsWith('data:')
                            ? img.path
                            : `${API_BASE_URL}${img.path}`,
                        }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>

                {/* Image indicators */}
                {listingImages.length > 1 && (
                  <View style={styles.imageIndicators}>
                    {listingImages.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.indicator,
                          currentImageIndex === index && styles.indicatorActive,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>{getCategoryEmoji()}</Text>
                <Text style={styles.noImageLabel}>No images available</Text>
              </View>
            )}
          </View>

          {/* Price Section */}
          <View style={styles.section}>
            <Text style={styles.price}>
              €{listing.price.toFixed(2)}
              {listing.quantity && listing.unit && (
                <Text style={styles.priceDetail}>
                  {' '}
                  / {listing.quantity} {listing.unit}
                </Text>
              )}
            </Text>
            <Text style={styles.title}>{listing.title}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>📍 {listing.city}</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaText}>{getCategoryEmoji()} {getCategoryName()}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {listing.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>
          )}

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{getCategoryName()}</Text>
            </View>
            {listing.quantity && listing.unit && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>
                  {listing.quantity} {listing.unit}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{listing.city}</Text>
            </View>
            {listing.createdAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Posted</Text>
                <Text style={styles.detailValue}>
                  {new Date(listing.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Seller Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            {loadingSeller ? (
              <ActivityIndicator color={Colors.primary} />
            ) : seller ? (
              <View style={styles.sellerCard}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerAvatarText}>
                    {seller.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>
                    {seller.name} {seller.surname}
                  </Text>
                  {seller.city && (
                    <Text style={styles.sellerLocation}>📍 {seller.city}</Text>
                  )}
                  {seller.phoneNumber && (
                    <Text style={styles.sellerPhone}>
                      📞 {seller.phoneNumber}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <Text style={styles.noSellerText}>
                Seller information unavailable
              </Text>
            )}
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Contact Button (Fixed at bottom) */}
        {seller && user?.id !== seller.id && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactSeller}
            >
              <Text style={styles.contactButtonText}>💬 Contact Seller</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: Colors.surfaceMuted,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceMuted,
  },
  noImageText: {
    fontSize: 64,
    marginBottom: 8,
  },
  noImageLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  indicatorActive: {
    backgroundColor: Colors.primary,
    opacity: 1,
    width: 24,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 8,
  },
  priceDetail: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '400',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  metaText: {
    color: Colors.textSubtle,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textSubtle,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    padding: 16,
    borderRadius: 12,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sellerAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  sellerLocation: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  sellerPhone: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  noSellerText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  contactButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
