package com.lostandfound.service;

import com.lostandfound.dto.DashboardResponse;
import com.lostandfound.model.ClaimStatus;
import com.lostandfound.model.ReportStatus;
import com.lostandfound.model.ReportType;
import com.lostandfound.repository.CategoryRepository;
import com.lostandfound.repository.ClaimRepository;
import com.lostandfound.repository.ItemReportRepository;
import com.lostandfound.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final ItemReportRepository reportRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public DashboardService(ItemReportRepository reportRepository,
                             ClaimRepository claimRepository,
                             UserRepository userRepository,
                             CategoryRepository categoryRepository) {
        this.reportRepository = reportRepository;
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public DashboardResponse getDashboardStats() {
        long openLost = reportRepository.countByTypeAndStatus(ReportType.LOST, ReportStatus.OPEN);
        long openFound = reportRepository.countByTypeAndStatus(ReportType.FOUND, ReportStatus.OPEN);
        long resolved = reportRepository.countByStatus(ReportStatus.RESOLVED);
        long pendingClaims = claimRepository.countByStatus(ClaimStatus.PENDING);
        long totalUsers = userRepository.count();
        long totalCategories = categoryRepository.count();

        return DashboardResponse.builder()
                .openLostReports(openLost)
                .openFoundReports(openFound)
                .resolvedCases(resolved)
                .pendingClaims(pendingClaims)
                .totalUsers(totalUsers)
                .totalCategories(totalCategories)
                .build();
    }
}
