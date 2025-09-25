package com.kazenites.listing.dto;

import java.math.BigDecimal;

public class ListingCreateRequest {
    public String title;
    public String description;
    public BigDecimal price;
    public String currency;
    public Double quantity;
    public String unit;
    public String city;
    public Long categoryId;
}
