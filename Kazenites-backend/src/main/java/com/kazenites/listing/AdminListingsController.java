package com.kazenites.listing;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/listings")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminListingsController {
    private final ListingRepository repo;

    public AdminListingsController(ListingRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Listing> listPending() {
        return repo.findByStatusOrderByCreatedAtDesc(ListingStatus.PENDING);
    }

    @PostMapping("/{id}/approve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void approve(@PathVariable Long id) {
    Listing l = repo.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
    if(l.getStatus() != ListingStatus.PENDING) return;
    l.setStatus(ListingStatus.APPROVED);
    repo.save(l);
}   

    @PostMapping("/{id}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reject(@PathVariable Long id) {
    Listing l = repo.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
    if (l.getStatus() != ListingStatus.PENDING) return;
    l.setStatus(ListingStatus.REJECTED);
    repo.save(l);
    }
}
