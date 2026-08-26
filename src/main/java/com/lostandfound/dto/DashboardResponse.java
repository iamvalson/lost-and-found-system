package com.lostandfound.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {
    private long openLostReports;
    private long openFoundReports;
    private long resolvedCases;
    private long pendingClaims;
    private long totalUsers;
    private long totalCategories;
}
