package com.example.demo.service;

import com.example.demo.model.Fact;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FactService {

    List<Fact> getAllFacts();

    Optional<Fact> getFactById(UUID id);

    Fact createFact(Fact fact);

    Fact updateFact(UUID id, Fact factDetails);

    void deleteFact(UUID id);

    List<Fact> searchFactsByTitle(String query);

    List<String> autocompleteTitles(String partial, int page, int size);

    Optional<Fact> findFactByTitleIgnoreCase(String title);

    Fact getRandomFact();
}