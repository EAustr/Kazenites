package com.kazenites.listing;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.server.ResponseStatusException;

import com.kazenites.listing.dto.ListingCreateRequest;
import com.kazenites.listing.dto.ListingUpdateRequest;
import com.kazenites.security.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/listings")
public class ListingController {
    private final ListingRepository repo;

    public ListingController(ListingRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Listing> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "all", required = false, defaultValue = "false") boolean all) {

        boolean isAdmin = principal != null && principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        String term = (q == null || q.isBlank()) ? null : q.trim();

        if (isAdmin && all) {
            if (term != null) {
                return repo.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(term);
            }
            return repo.findAll();
        }

        if (term != null) {
            return repo.findByStatusAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(ListingStatus.APPROVED, term);
        }
        return repo.findByStatusOrderByCreatedAtDesc(ListingStatus.APPROVED);
    }

    @GetMapping("/my-listings")
    public List<Listing> getMyListings(@AuthenticationPrincipal UserPrincipal principal) {
    if (principal == null) {
        throw new ListingForbiddenException();
    }
    Long ownerId = principal.getUser().getId();
    return repo.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    @GetMapping("/{id}")
    public Listing get(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        Listing l = repo.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
        boolean isAdmin = principal != null && principal.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && l.getStatus() != ListingStatus.APPROVED) {
            throw new ListingForbiddenException();
        }
        return l;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Listing create(@Valid @RequestBody ListingCreateRequest req, @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new ListingForbiddenException();
        }

        Listing l = new Listing();
        l.setTitle(req.title);
        l.setDescription(req.description);
        l.setPrice(req.price);
        l.setCurrency(req.currency != null ? req.currency : "EUR");
        l.setQuantity(req.quantity);
        l.setUnit(req.unit != null ? req.unit : ListingMUnits.KG);
        l.setCity(req.city);
        l.setCategoryId(req.categoryId);
        l.setOwnerId(principal.getUser().getId());
        l.setStatus(ListingStatus.PENDING);

        return repo.save(l);
    }

    @PutMapping("/{id}")
    public Listing update(@PathVariable Long id, @Valid @RequestBody ListingUpdateRequest req,
                          @AuthenticationPrincipal UserPrincipal principal) {
        Listing l = repo.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
        boolean isOwner = l.getOwnerId().equals(principal.getUser().getId());
        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isOwner && !isAdmin) throw new ListingForbiddenException();

        if (req.title != null) l.setTitle(req.title);
        if (req.description != null) l.setDescription(req.description);
        if (req.price != null) l.setPrice(req.price);
        if (req.currency != null) l.setCurrency(req.currency);
        if (req.quantity != null) l.setQuantity(req.quantity);
        if (req.unit != null) l.setUnit(req.unit);
        if (req.city != null) l.setCity(req.city);
        if (req.categoryId != null) l.setCategoryId(req.categoryId);

        return repo.save(l);
    }

    @PutMapping("/{id}/republish")
    public Listing republish(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
    Listing l = repo.findById(id).orElseThrow(() -> new ListingNotFoundException(id));

    if (principal == null) {
        throw new ListingForbiddenException();
    }

    boolean isOwner = l.getOwnerId().equals(principal.getUser().getId());
    if (!isOwner) {
        throw new ListingForbiddenException();
    }

    if (l.getStatus() != ListingStatus.REJECTED) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only rejected listings can be republished.");
    }

    l.setStatus(ListingStatus.PENDING);
    return repo.save(l);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        Listing l = repo.findById(id).orElseThrow(() -> new ListingNotFoundException(id));
        boolean isOwner = l.getOwnerId().equals(principal.getUser().getId());
        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isOwner && !isAdmin) throw new ListingForbiddenException();
        repo.deleteById(id);
    }

    // @GetMapping("/my-listings")
    // public List<Listing> getMyListings(@AuthenticationPrincipal UserPrincipal principal) {
    //     return repo.findByOwnerIdOrderByCreatedAtDesc(principal.getUser().getId());
    // }
}