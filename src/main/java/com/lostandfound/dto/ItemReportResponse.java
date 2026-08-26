package com.lostandfound.dto;

import com.lostandfound.model.ReportStatus;
import com.lostandfound.model.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemReportResponse {
    private Long id;
    private ReportType type;
    private Long categoryId;
    private String categoryName;
    private String description;
    private String location;
    private String holdingLocation;
    private LocalDate dateOccurred;
    private ReportStatus status;
    private Long reportedById;
    private String reportedByName;
    private String reportedByEmail;
    private LocalDateTime createdAt;
}
