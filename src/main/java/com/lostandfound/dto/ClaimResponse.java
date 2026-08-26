package com.lostandfound.dto;

import com.lostandfound.model.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClaimResponse {
    private Long id;
    private Long itemReportId;
    private ItemReportResponse itemReport;
    private Long claimedById;
    private String claimedByName;
    private String claimedByEmail;
    private String note;
    private ClaimStatus status;
    private LocalDateTime createdAt;
}
