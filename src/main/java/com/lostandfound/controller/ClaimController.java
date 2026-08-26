package com.lostandfound.controller;

import com.lostandfound.dto.ClaimRequest;
import com.lostandfound.dto.ClaimResponse;
import com.lostandfound.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    // Student endpoints
    @PostMapping("/api/claims")
    public ResponseEntity<ClaimResponse> submitClaim(
            @Valid @RequestBody ClaimRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ClaimResponse response = claimService.submitClaim(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/claims/my")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(claimService.getMyClaims(userDetails.getUsername()));
    }

    // Admin endpoints
    @GetMapping("/api/admin/claims")
    public ResponseEntity<List<ClaimResponse>> getAllPendingClaims() {
        return ResponseEntity.ok(claimService.getAllPendingClaims());
    }

    @GetMapping("/api/admin/claims/report/{reportId}")
    public ResponseEntity<List<ClaimResponse>> getClaimsByReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(claimService.getClaimsByReport(reportId));
    }

    @PutMapping("/api/admin/claims/{id}/confirm")
    public ResponseEntity<ClaimResponse> confirmClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.confirmClaim(id));
    }

    @PutMapping("/api/admin/claims/{id}/reject")
    public ResponseEntity<ClaimResponse> rejectClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.rejectClaim(id));
    }
}
