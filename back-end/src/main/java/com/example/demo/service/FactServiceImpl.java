package com.example.demo.service;

import com.example.demo.model.Fact;
import com.example.demo.repository.FactRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FactServiceImpl implements FactService {

    private final FactRepository factRepository;

    public FactServiceImpl(FactRepository factRepository) {
        this.factRepository = factRepository;
    }

    @Override
    public List<Fact> getAllFacts() {
        return factRepository.findAll();
    }

    @Override
    public Optional<Fact> getFactById(UUID id) {
        return factRepository.findById(id);
    }

    @Override
    public Fact createFact(Fact fact) {
        return factRepository.save(fact);
    }

    @Override
    public Fact updateFact(UUID id, Fact factDetails) {
        Fact fact = factRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fact not found with id: " + id));

        fact.setTitle(factDetails.getTitle());
        fact.setBody(factDetails.getBody());
        fact.setTag(factDetails.getTag());
        fact.setSourceUrl(factDetails.getSourceUrl());

        return factRepository.save(fact);
    }

    @Override
    public void deleteFact(UUID id) {
        Fact fact = factRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fact not found with id: " + id));
        factRepository.delete(fact);
    }

    @Override
    public List<Fact> searchFactsByTitle(String query) {
        return factRepository.searchByTitle(query);
    }

    @Override
    public List<String> autocompleteTitles(String partial, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return factRepository.autocompleteTitles(partial, pageable);
    }

    @Override
    public Optional<Fact> findFactByTitleIgnoreCase(String title) {
        return factRepository.findByTitleIgnoreCase(title);
    }

    @Override
    public Fact getRandomFact() {
        return factRepository.findRandomFact();
    }
}