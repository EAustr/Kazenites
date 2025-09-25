package com.kazenites.listing;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    List<ListingImage> findByListingIdOrderBySortOrderAsc(Long listingId);
}
