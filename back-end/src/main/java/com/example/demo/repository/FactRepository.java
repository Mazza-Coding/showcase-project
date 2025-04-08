package com.example.demo.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.model.Fact;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FactRepository extends JpaRepository<Fact, UUID> {
    List<Fact> searchByTitle(String query);

    @Query("SELECT f.title FROM Fact f WHERE LOWER(f.title) LIKE LOWER(CONCAT(:partial, '%'))")
    List<String> autocompleteTitles(String partial, Pageable pageable);

    Optional<Fact> findByTitleIgnoreCase(String title);

    @Query(value = "SELECT * FROM facts ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Fact findRandomFact();
}