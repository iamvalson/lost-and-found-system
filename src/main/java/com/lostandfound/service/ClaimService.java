package com.lostandfound.service;

import com.lostandfound.dto.ClaimRequest;
import com.lostandfound.dto.ClaimResponse;
import com.lostandfound.model.*;
import com.lostandfound.repository.ClaimRepository;
import com.lostandfound.repository.ItemReportRepository;
import com.lostandfound.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ItemReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ItemReportService reportService;

    public ClaimService(ClaimRepository claimRepository,
                        ItemReportRepository reportRepository,
                        UserRepository userRepository,
                        ItemReportService reportService) {
        this.claimRepository = claimRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.reportService = reportService;
    }

    @Transactional
    public ClaimResponse submitClaim(ClaimRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        ItemReport report = reportRepository.findById(request.getItemReportId())
                .orElseThrow(() -> new IllegalArgumentException("Item report not found: " + request.getItemReportId()));

        if (report.getType() != ReportType.FOUND) {
            throw new IllegalArgumentException("Claims can only be submitted against FOUND item reports");
        }

        if (report.getStatus() == ReportStatus.RESOLVED) {
            throw new IllegalArgumentException("This item report has already been resolved");
        }

        if (claimRepository.existsByItemReportIdAndClaimedById(report.getId(), user.getId())) {
            throw new IllegalArgumentException("You have already submitted a claim for this item");
        }

        Claim claim = Claim.builder()
                .itemReport(report)
                .claimedBy(user)
                .note(request.getNote())
                .status(ClaimStatus.PENDING)
                .build();

        Claim saved = claimRepository.save(claim);
        return mapToResponse(saved);
    }

    public List<ClaimResponse> getMyClaims(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        return claimRepository.findByClaimedById(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ClaimResponse> getAllPendingClaims() {
        return claimRepository.findByStatus(ClaimStatus.PENDING).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ClaimResponse> getClaimsByReport(Long reportId) {
        return claimRepository.findByItemReportId(reportId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClaimResponse confirmClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found: " + claimId));

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalArgumentException("Claim is not in PENDING status");
        }

        // 1. Confirm this claim
        claim.setStatus(ClaimStatus.CONFIRMED);
        Claim confirmed = claimRepository.save(claim);

        // 2. Mark the target FOUND report as RESOLVED
        ItemReport foundReport = claim.getItemReport();
        foundReport.setStatus(ReportStatus.RESOLVED);
        reportRepository.save(foundReport);

        // 3. Reject all other pending claims on the same report
        List<Claim> otherClaims = claimRepository.findByItemReportId(foundReport.getId());
        for (Claim c : otherClaims) {
            if (!c.getId().equals(claimId) && c.getStatus() == ClaimStatus.PENDING) {
                c.setStatus(ClaimStatus.REJECTED);
                claimRepository.save(c);
            }
        }

        // 4. Optionally close matching LOST reports reported by the claimant or matching category/description
        List<ItemReport> claimantLostReports = reportRepository.findByReportedById(claim.getClaimedBy().getId());
        for (ItemReport lostReport : claimantLostReports) {
            if (lostReport.getType() == ReportType.LOST &&
                lostReport.getStatus() == ReportStatus.OPEN &&
                lostReport.getCategory().getId().equals(foundReport.getCategory().getId())) {
                lostReport.setStatus(ReportStatus.RESOLVED);
                reportRepository.save(lostReport);
            }
        }

        return mapToResponse(confirmed);
    }

    @Transactional
    public ClaimResponse rejectClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found: " + claimId));

        if (claim.getStatus() != ClaimStatus.PENDING) {
            throw new IllegalArgumentException("Claim is not in PENDING status");
        }

        claim.setStatus(ClaimStatus.REJECTED);
        Claim rejected = claimRepository.save(claim);
        return mapToResponse(rejected);
    }

    private ClaimResponse mapToResponse(Claim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .itemReportId(claim.getItemReport().getId())
                .itemReport(reportService.mapToResponse(claim.getItemReport()))
                .claimedById(claim.getClaimedBy().getId())
                .claimedByName(claim.getClaimedBy().getName())
                .claimedByEmail(claim.getClaimedBy().getEmail())
                .note(claim.getNote())
                .status(claim.getStatus())
                .createdAt(claim.getCreatedAt())
                .build();
    }
}
