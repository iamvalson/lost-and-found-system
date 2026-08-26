package com.lostandfound.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MatchResponse {
    private ItemReportResponse report;
    private int matchScore; // Score e.g. 2 or 3
    private List<String> matchReasons; // e.g. ["Same category", "Overlapping keywords: 'glasses'", "Similar location", "Close date"]
}
