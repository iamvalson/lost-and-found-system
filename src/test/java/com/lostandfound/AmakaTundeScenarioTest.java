package com.lostandfound;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lostandfound.dto.*;
import com.lostandfound.model.ClaimStatus;
import com.lostandfound.model.ReportStatus;
import com.lostandfound.model.ReportType;
import com.lostandfound.model.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AmakaTundeScenarioTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Complete End-to-End Walkthrough: Amaka & Tunde Reading Glasses Case Study (Section 4)")
    public void testAmakaTundeScenario() throws Exception {

        // ==========================================
        // Setup: Register Amaka (Student) and Admin
        // ==========================================
        RegisterRequest amakaReg = new RegisterRequest();
        amakaReg.setName("Amaka Okafor");
        amakaReg.setEmail("amaka@student.edu");
        amakaReg.setPassword("amaka123");
        amakaReg.setRole(Role.STUDENT);

        MvcResult amakaRes = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(amakaReg)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse amakaAuth = objectMapper.readValue(amakaRes.getResponse().getContentAsString(), AuthResponse.class);
        String amakaToken = "Bearer " + amakaAuth.getToken();

        RegisterRequest securityReg = new RegisterRequest();
        securityReg.setName("Main Gate Security Post");
        securityReg.setEmail("security@campus.edu");
        securityReg.setPassword("security123");
        securityReg.setRole(Role.ADMIN);

        MvcResult securityRes = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(securityReg)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse securityAuth = objectMapper.readValue(securityRes.getResponse().getContentAsString(), AuthResponse.class);
        String securityToken = "Bearer " + securityAuth.getToken();

        // Get Categories (find Accessories category ID)
        MvcResult catRes = mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andReturn();

        CategoryResponse[] categories = objectMapper.readValue(catRes.getResponse().getContentAsString(), CategoryResponse[].class);
        Long accessoriesCatId = null;
        for (CategoryResponse cat : categories) {
            if ("Accessories".equalsIgnoreCase(cat.getName())) {
                accessoriesCatId = cat.getId();
                break;
            }
        }
        assertNotNull(accessoriesCatId, "Accessories category should be present");

        // ==========================================
        // Step 1 — Amaka reports the loss
        // ==========================================
        ItemReportRequest lostReq = new ItemReportRequest();
        lostReq.setType(ReportType.LOST);
        lostReq.setCategoryId(accessoriesCatId);
        lostReq.setDescription("black-framed reading glasses, slightly scratched left lens");
        lostReq.setLocation("Campus shuttle, Main Gate to Faculty of Science route");
        lostReq.setDateOccurred(LocalDate.now());

        MvcResult lostRes = mockMvc.perform(post("/api/reports")
                        .header("Authorization", amakaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lostReq)))
                .andExpect(status().isCreated())
                .andReturn();

        ItemReportResponse lostReport = objectMapper.readValue(lostRes.getResponse().getContentAsString(), ItemReportResponse.class);
        assertEquals(ReportStatus.OPEN, lostReport.getStatus());

        // ==========================================
        // Step 2 — Security logs the find
        // ==========================================
        ItemReportRequest foundReq = new ItemReportRequest();
        foundReq.setType(ReportType.FOUND);
        foundReq.setCategoryId(accessoriesCatId);
        foundReq.setDescription("black reading glasses found on shuttle seat");
        foundReq.setLocation("Main Gate shuttle stop");
        foundReq.setHoldingLocation("Main Gate security post");
        foundReq.setDateOccurred(LocalDate.now());

        MvcResult foundRes = mockMvc.perform(post("/api/reports")
                        .header("Authorization", securityToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(foundReq)))
                .andExpect(status().isCreated())
                .andReturn();

        ItemReportResponse foundReport = objectMapper.readValue(foundRes.getResponse().getContentAsString(), ItemReportResponse.class);
        assertEquals(ReportStatus.OPEN, foundReport.getStatus());

        // ==========================================
        // Step 3 — System suggests a match
        // ==========================================
        MvcResult matchRes = mockMvc.perform(get("/api/reports/" + lostReport.getId() + "/matches")
                        .header("Authorization", amakaToken))
                .andExpect(status().isOk())
                .andReturn();

        MatchResponse[] matches = objectMapper.readValue(matchRes.getResponse().getContentAsString(), MatchResponse[].class);
        assertTrue(matches.length > 0, "System should surface at least 1 match for Amaka");
        assertEquals(foundReport.getId(), matches[0].getReport().getId(), "Match should be the security post's found report");
        assertTrue(matches[0].getMatchScore() >= 2, "Match score should be at least 2");

        // ==========================================
        // Step 4 — Amaka submits a claim
        // ==========================================
        ClaimRequest claimReq = new ClaimRequest();
        claimReq.setItemReportId(foundReport.getId());
        claimReq.setNote("The reading glasses have a slight scratch on the left lens. They belong to Amaka.");

        MvcResult claimRes = mockMvc.perform(post("/api/claims")
                        .header("Authorization", amakaToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(claimReq)))
                .andExpect(status().isCreated())
                .andReturn();

        ClaimResponse claimResponse = objectMapper.readValue(claimRes.getResponse().getContentAsString(), ClaimResponse.class);
        assertEquals(ClaimStatus.PENDING, claimResponse.getStatus());

        // ==========================================
        // Step 5 — The claim is confirmed by Admin
        // ==========================================
        MvcResult confirmRes = mockMvc.perform(put("/api/admin/claims/" + claimResponse.getId() + "/confirm")
                        .header("Authorization", securityToken))
                .andExpect(status().isOk())
                .andReturn();

        ClaimResponse confirmedClaim = objectMapper.readValue(confirmRes.getResponse().getContentAsString(), ClaimResponse.class);
        assertEquals(ClaimStatus.CONFIRMED, confirmedClaim.getStatus());

        // Verify report statuses are now RESOLVED
        MvcResult updatedFoundRes = mockMvc.perform(get("/api/reports/" + foundReport.getId())
                        .header("Authorization", amakaToken))
                .andExpect(status().isOk())
                .andReturn();
        ItemReportResponse updatedFound = objectMapper.readValue(updatedFoundRes.getResponse().getContentAsString(), ItemReportResponse.class);
        assertEquals(ReportStatus.RESOLVED, updatedFound.getStatus());

        // Check Admin Dashboard stats
        MvcResult dashRes = mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", securityToken))
                .andExpect(status().isOk())
                .andReturn();

        DashboardResponse dash = objectMapper.readValue(dashRes.getResponse().getContentAsString(), DashboardResponse.class);
        assertTrue(dash.getResolvedCases() >= 1, "Dashboard should record at least 1 resolved case");
    }
}
