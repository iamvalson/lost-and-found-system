package com.lostandfound.repository;

import com.lostandfound.model.Claim;
import com.lostandfound.model.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByItemReportId(Long itemReportId);

    List<Claim> findByClaimedById(Long userId);

    List<Claim> findByStatus(ClaimStatus status);

    boolean existsByItemReportIdAndClaimedById(Long itemReportId, Long claimedById);

    Optional<Claim> findByItemReportIdAndClaimedById(Long itemReportId, Long claimedById);

    long countByStatus(ClaimStatus status);
}
