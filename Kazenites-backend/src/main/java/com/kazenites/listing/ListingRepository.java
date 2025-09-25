package com.kazenites.listing;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    java.util.List<Listing> findByStatusOrderByCreatedAtDesc(ListingStatus status);
}
