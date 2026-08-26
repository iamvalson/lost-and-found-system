package com.lostandfound.controller;

import com.lostandfound.dto.ItemReportRequest;
import com.lostandfound.dto.ItemReportResponse;
import com.lostandfound.dto.MatchResponse;
import com.lostandfound.model.ReportType;
import com.lostandfound.service.ItemReportService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ItemReportController {

    private final ItemReportService reportService;

    public ItemReportController(ItemReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ItemReportResponse> createReport(
            @Valid @RequestBody ItemReportRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ItemReportResponse response = reportService.createReport(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItemReportResponse>> getMyReports(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(reportService.getReportsByUser(userDetails.getUsername()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItemReportResponse>> searchReports(
            @RequestParam(required = false) ReportType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.searchReports(type, categoryId, keyword, location, startDate, endDate));
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<MatchResponse>> getMatchesForReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getMatchesForReport(id));
    }
}
