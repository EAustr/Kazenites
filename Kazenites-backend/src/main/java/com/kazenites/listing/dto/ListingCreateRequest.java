package com.kazenites.listing.dto;

import java.math.BigDecimal;

import com.kazenites.listing.ListingMUnits;

public class ListingCreateRequest {
    public String title;
    public String description;
    public BigDecimal price;
    public String currency;
    public Double quantity;
    public ListingMUnits unit;
    public String city;
    public Long categoryId;
}
