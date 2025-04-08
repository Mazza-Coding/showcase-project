package com.example.demo.controller;

import com.example.demo.model.Fact;
import com.example.demo.service.FactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/facts")
@Tag(name = "Fact API", description = "API for managing and retrieving interesting facts")
public class FactController {

    private final FactService factService;

    public FactController(FactService factService) {
        this.factService = factService;
    }

    @Operation(summary = "Get all facts", description = "Returns a complete list of all stored facts.")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved list", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = List.class)))
    @GetMapping
    public List<Fact> getAllFacts() {
        return factService.getAllFacts();
    }

    @Operation(summary = "Search facts by title", description = "Returns a list of facts whose titles contain the search query (case-insensitive).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list of matching facts", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "400", description = "Invalid query parameter supplied", content = @Content)
    })
    @GetMapping("/search")
    public List<Fact> searchFacts(
            @Parameter(description = "The search term to filter fact titles by", required = true) @RequestParam String query) {
        return factService.searchFactsByTitle(query);
    }

    @Operation(summary = "Autocomplete fact titles", description = "Returns a list of fact titles starting with the provided partial string, suitable for autocomplete suggestions.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list of title suggestions", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = List.class))),
            @ApiResponse(responseCode = "400", description = "Invalid parameters supplied", content = @Content)
    })
    @GetMapping("/autocomplete")
    public List<String> autocompleteTitles(
            @Parameter(description = "The partial title string to search for", required = true) @RequestParam String partial,
            @Parameter(description = "Page number for pagination (0-indexed)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of results per page") @RequestParam(defaultValue = "10") int size) {
        return factService.autocompleteTitles(partial, page, size);
    }

    @Operation(summary = "Get a random fact", description = "Returns a single, randomly selected fact.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved a random fact", content = {
                    @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = Fact.class)) }),
            @ApiResponse(responseCode = "404", description = "No facts found in the database", content = @Content)
    })
    @GetMapping("/random")
    public ResponseEntity<Fact> getRandomFact() {
        Fact randomFact = factService.getRandomFact();
        if (randomFact != null) {
            return ResponseEntity.ok(randomFact);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(summary = "Get fact by exact title", description = "Returns a single fact matching the provided title exactly (case-insensitive).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the fact", content = {
                    @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(implementation = Fact.class)) }),
            @ApiResponse(responseCode = "404", description = "Fact with the specified title not found", content = @Content)
    })
    @GetMapping("/title/{title}")
    public ResponseEntity<Fact> getFactByTitle(
            @Parameter(description = "The exact title of the fact to retrieve", required = true) @PathVariable String title) {
        Optional<Fact> factOptional = factService.findFactByTitleIgnoreCase(title);
        return factOptional.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

}