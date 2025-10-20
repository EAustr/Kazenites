import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { API_BASE_URL } from '../config';
import type { ListingImage as ListingImageType } from '../types';

type Props = {
  listingId: number;
  width?: number;
  height?: number;
};

export default function ListingImage({ listingId, width = 80, height = 80 }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        console.log(`Fetching images for listing ${listingId}`);
        const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}/images`);
        console.log(`Image fetch response status: ${response.status}`);
        if (response.ok) {
          const images: ListingImageType[] = await response.json();
          console.log(`Found ${images.length} images for listing ${listingId}`);
          if (images.length > 0) {
            console.log(`Setting image URL: ${images[0].path?.substring(0, 50)}...`);
            setImageUrl(images[0].path); // Show first image
          } else {
            // For now, use a placeholder image for listings that should have images
            // This is just for testing the layout
            setImageUrl('https://via.placeholder.com/150x150/4f46e5/ffffff?text=🍎');
          }
        } else {
          console.log(`Failed to fetch images: ${response.status} ${response.statusText}`);
          // Use placeholder for testing
          setImageUrl('https://via.placeholder.com/150x150/4f46e5/ffffff?text=🥕');
        }
      } catch (error) {
        console.log('Failed to fetch image for listing', listingId, error);
        // Use placeholder for testing
        setImageUrl('https://via.placeholder.com/150x150/ef4444/ffffff?text=🥬');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [listingId]);

  if (loading) {
    return (
      <View style={[styles.placeholder, { width, height }]} />
    );
  }

  if (!imageUrl) {
    return (
      <View style={[styles.noImage, { width, height }]} />
    );
  }

  return (
    <Image 
      source={{ uri: imageUrl }} 
      style={[styles.image, { width, height }]}
      resizeMode="cover"
      onLoad={() => console.log('Image loaded successfully')}
      onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  placeholder: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  noImage: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});