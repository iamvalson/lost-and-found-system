package com.lostandfound.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClaimRequest {

    @NotNull(message = "Item report ID is required")
    private Long itemReportId;

    @NotBlank(message = "Claim note/proof is required")
    private String note;
}
