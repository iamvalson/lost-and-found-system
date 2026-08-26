package com.lostandfound.service;

import com.lostandfound.dto.ItemReportRequest;
import com.lostandfound.dto.ItemReportResponse;
import com.lostandfound.dto.MatchResponse;
import com.lostandfound.model.Category;
import com.lostandfound.model.ItemReport;
import com.lostandfound.model.ReportStatus;
import com.lostandfound.model.ReportType;
import com.lostandfound.model.User;
import com.lostandfound.repository.CategoryRepository;
import com.lostandfound.repository.ItemReportRepository;
import com.lostandfound.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemReportService {

    private final ItemReportRepository reportRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final MatchingService matchingService;

    public ItemReportService(ItemReportRepository reportRepository,
                             CategoryRepository categoryRepository,
                             UserRepository userRepository,
                             MatchingService matchingService) {
        this.reportRepository = reportRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.matchingService = matchingService;
    }

    public ItemReportResponse createReport(ItemReportRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.getCategoryId()));

        ItemReport report = ItemReport.builder()
                .type(request.getType())
                .category(category)
                .description(request.getDescription())
                .location(request.getLocation())
                .holdingLocation(request.getType() == ReportType.FOUND ? request.getHoldingLocation() : null)
                .dateOccurred(request.getDateOccurred())
                .status(ReportStatus.OPEN)
                .reportedBy(user)
                .build();

        ItemReport saved = reportRepository.save(report);
        return mapToResponse(saved);
    }

    public ItemReportResponse getReportById(Long id) {
        ItemReport report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + id));
        return mapToResponse(report);
    }

    public List<ItemReportResponse> getReportsByUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        return reportRepository.findByReportedById(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ItemReportResponse> searchReports(ReportType type, Long categoryId, String keyword, String location, LocalDate startDate, LocalDate endDate) {
        return reportRepository.searchReports(type, categoryId, keyword, location, startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MatchResponse> getMatchesForReport(Long reportId) {
        ItemReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found with ID: " + reportId));
        return matchingService.findMatchesForReport(report, this);
    }

    public ItemReportResponse mapToResponse(ItemReport report) {
        return ItemReportResponse.builder()
                .id(report.getId())
                .type(report.getType())
                .categoryId(report.getCategory().getId())
                .categoryName(report.getCategory().getName())
                .description(report.getDescription())
                .location(report.getLocation())
                .holdingLocation(report.getHoldingLocation())
                .dateOccurred(report.getDateOccurred())
                .status(report.getStatus())
                .reportedById(report.getReportedBy().getId())
                .reportedByName(report.getReportedBy().getName())
                .reportedByEmail(report.getReportedBy().getEmail())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
