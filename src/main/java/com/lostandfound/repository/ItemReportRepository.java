package com.lostandfound.repository;

import com.lostandfound.model.ItemReport;
import com.lostandfound.model.ReportStatus;
import com.lostandfound.model.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemReportRepository extends JpaRepository<ItemReport, Long> {

    List<ItemReport> findByType(ReportType type);

    List<ItemReport> findByReportedById(Long userId);

    List<ItemReport> findByStatus(ReportStatus status);

    long countByTypeAndStatus(ReportType type, ReportStatus status);

    long countByStatus(ReportStatus status);

    // Search query with filters
    @Query("SELECT r FROM ItemReport r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:categoryId IS NULL OR r.category.id = :categoryId) AND " +
           "(:keyword IS NULL OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(r.location) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:startDate IS NULL OR r.dateOccurred >= :startDate) AND " +
           "(:endDate IS NULL OR r.dateOccurred <= :endDate) " +
           "ORDER BY r.createdAt DESC")
    List<ItemReport> searchReports(
            @Param("type") ReportType type,
            @Param("categoryId") Long categoryId,
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Query for potential matching reports (opposite type, same category, OPEN status)
    @Query("SELECT r FROM ItemReport r WHERE " +
           "r.type = :oppositeType AND " +
           "r.category.id = :categoryId AND " +
           "r.status = 'OPEN' AND " +
           "r.id <> :excludeId")
    List<ItemReport> findCandidatesForMatching(
            @Param("oppositeType") ReportType oppositeType,
            @Param("categoryId") Long categoryId,
            @Param("excludeId") Long excludeId
    );
}
