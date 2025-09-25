package com.kazenites.listing;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class ListingForbiddenException extends RuntimeException {
    public ListingForbiddenException() {
        super("Not allowed to modify this listing");
    }
}
