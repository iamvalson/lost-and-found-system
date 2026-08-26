package com.lostandfound.dto;

import com.lostandfound.model.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ItemReportRequest {

    @NotNull(message = "Report type (LOST or FOUND) is required")
    private ReportType type;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    // Optional holding location (where the item is currently kept for FOUND items)
    private String holdingLocation;

    @NotNull(message = "Date occurred is required")
    private LocalDate dateOccurred;
}
