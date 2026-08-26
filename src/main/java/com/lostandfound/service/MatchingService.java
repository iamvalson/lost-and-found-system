package com.lostandfound.service;

import com.lostandfound.dto.ItemReportResponse;
import com.lostandfound.dto.MatchResponse;
import com.lostandfound.model.ItemReport;
import com.lostandfound.model.ReportType;
import com.lostandfound.repository.ItemReportRepository;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class MatchingService {

    private final ItemReportRepository reportRepository;

    public MatchingService(ItemReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<MatchResponse> findMatchesForReport(ItemReport targetReport, ItemReportService reportService) {
        ReportType oppositeType = (targetReport.getType() == ReportType.LOST) ? ReportType.FOUND : ReportType.LOST;

        List<ItemReport> candidates = reportRepository.findCandidatesForMatching(
                oppositeType,
                targetReport.getCategory().getId(),
                targetReport.getId()
        );

        List<MatchResponse> matches = new ArrayList<>();

        for (ItemReport candidate : candidates) {
            int score = 1; // 1 point for same category
            List<String> reasons = new ArrayList<>();
            reasons.add("Same category (" + targetReport.getCategory().getName() + ")");

            // 1. Keyword overlap check
            Set<String> targetKeywords = extractKeywords(targetReport.getDescription());
            Set<String> candidateKeywords = extractKeywords(candidate.getDescription());
            Set<String> overlap = new HashSet<>(targetKeywords);
            overlap.retainAll(candidateKeywords);

            if (!overlap.isEmpty()) {
                score++;
                reasons.add("Overlapping keywords: " + String.join(", ", overlap));
            }

            // 2. Location proximity check
            if (isLocationSimilar(targetReport.getLocation(), candidate.getLocation())) {
                score++;
                reasons.add("Similar location ('" + targetReport.getLocation() + "' ~ '" + candidate.getLocation() + "')");
            }

            // 3. Close date check (within 7 days)
            if (targetReport.getDateOccurred() != null && candidate.getDateOccurred() != null) {
                long daysDiff = Math.abs(ChronoUnit.DAYS.between(targetReport.getDateOccurred(), candidate.getDateOccurred()));
                if (daysDiff <= 7) {
                    score++;
                    reasons.add("Close date (" + daysDiff + " day(s) apart)");
                }
            }

            // Require score >= 2 (Category + at least 1 other criteria)
            if (score >= 2) {
                matches.add(MatchResponse.builder()
                        .report(reportService.mapToResponse(candidate))
                        .matchScore(score)
                        .matchReasons(reasons)
                        .build());
            }
        }

        // Sort by match score descending
        matches.sort((a, b) -> Integer.compare(b.getMatchScore(), a.getMatchScore()));
        return matches;
    }

    private Set<String> extractKeywords(String text) {
        if (text == null) return Collections.emptySet();
        Set<String> stopWords = Set.of("the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "with", "my", "of", "is", "was", "near", "by");
        String clean = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ");
        String[] tokens = clean.split("\\s+");
        Set<String> keywords = new HashSet<>();
        for (String token : tokens) {
            if (token.length() > 2 && !stopWords.contains(token)) {
                keywords.add(token);
            }
        }
        return keywords;
    }

    private boolean isLocationSimilar(String loc1, String loc2) {
        if (loc1 == null || loc2 == null) return false;
        String l1 = loc1.toLowerCase();
        String l2 = loc2.toLowerCase();
        if (l1.contains(l2) || l2.contains(l1)) return true;

        Set<String> words1 = extractKeywords(loc1);
        Set<String> words2 = extractKeywords(loc2);
        Set<String> overlap = new HashSet<>(words1);
        overlap.retainAll(words2);
        return !overlap.isEmpty();
    }
}
