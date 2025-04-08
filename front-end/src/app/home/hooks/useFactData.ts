import { useState, useCallback, useEffect } from "react";
import { Fact } from "../types";

const fetchFactByTitleFromApi = async (title: string): Promise<Fact | null> => {
  try {
    const response = await fetch(
      `/api/facts/title/${encodeURIComponent(title)}`
    );
    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        `Failed to fetch fact by title "${title}": ${response.status}`,
        responseText
      );
      return null;
    }

    try {
      const fact: Fact = JSON.parse(responseText);
      if (fact && fact.id && fact.title && fact.body) {
        return fact;
      } else {
        console.warn(
          `Received incomplete fact data for title "${title}":`,
          fact
        );
        return null;
      }
    } catch (jsonError) {
      console.error(
        `Failed to parse JSON for title "${title}":`,
        responseText,
        jsonError
      );
      return null;
    }
  } catch (error) {
    console.error(`Network error fetching fact by title "${title}":`, error);
    return null;
  }
};

export function useFactData(initialFacts: Fact[] = [], initialLoading = true) {
  const [facts, setFacts] = useState<Fact[]>(initialFacts);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const fetchRandomFacts = useCallback(async (count: number) => {
    setIsLoading(true);
    setError(null);
    setFacts([]);
    setProgress(0);
    try {
      const fetchedFactsSet = new Map<string, Fact>();
      let attempts = 0;
      const maxAttempts = count * 3;

      while (fetchedFactsSet.size < count && attempts < maxAttempts) {
        attempts++;
        const response = await fetch("/api/facts/random");
        const responseText = await response.text();
        if (!response.ok) {
          console.error(
            "Random Fact API Error:",
            response.status,
            responseText
          );
          throw new Error(
            `HTTP error fetching random fact! status: ${response.status}`
          );
        }
        try {
          const fact = JSON.parse(responseText);
          if (fact && fact.id && !fetchedFactsSet.has(fact.id)) {
            fetchedFactsSet.set(fact.id, fact);
          } else if (!fact || !fact.id) {
            console.warn("Received random fact without ID:", fact);
          }
        } catch (jsonError) {
          console.error(
            "Failed to parse JSON for random fact:",
            responseText,
            jsonError
          );
          throw new Error("Received non-JSON response from random fact API.");
        }
      }

      if (fetchedFactsSet.size < count) {
        console.warn(
          `Could only fetch ${fetchedFactsSet.size} unique random facts after ${attempts} attempts.`
        );
      }
      setFacts(Array.from(fetchedFactsSet.values()));
    } catch (e) {
      console.error("Failed to fetch random facts:", e);
      setError(
        e instanceof Error
          ? e.message
          : "An unknown error occurred while fetching random facts."
      );
      setFacts([]);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  }, []);

  const searchFactsByTitle = useCallback(async (title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setIsLoading(true);
    setError(null);
    setFacts([]);
    setProgress(0);

    try {
      const fact = await fetchFactByTitleFromApi(trimmedTitle);
      if (fact) {
        setFacts([fact]);
      } else {
        console.warn(
          `Could not fetch details for selected suggestion: ${trimmedTitle}`
        );
        setFacts([]);
      }
    } catch (e) {
      console.error(`Error searching for single fact "${trimmedTitle}":`, e);
      setError(
        e instanceof Error ? e.message : "An unknown search error occurred"
      );
      setFacts([]);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  }, []);

  const searchFactsFromAutocomplete = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setIsLoading(true);
    setError(null);
    setFacts([]);
    setProgress(0);

    const MAX_RESULTS_FROM_AUTOCOMPLETE = 10;

    try {
      const autocompleteResponse = await fetch(
        `/api/facts/autocomplete?partial=${encodeURIComponent(trimmedQuery)}`
      );

      if (!autocompleteResponse.ok) {
        throw new Error(
          `Autocomplete request failed: ${autocompleteResponse.status}`
        );
      }

      let suggestedTitles: string[] = [];
      const autocompleteContentType =
        autocompleteResponse.headers.get("content-type");
      if (
        autocompleteContentType &&
        autocompleteContentType.indexOf("application/json") !== -1
      ) {
        suggestedTitles = await autocompleteResponse.json();
      } else {
        const text = await autocompleteResponse.text();
        console.warn("Autocomplete for submit returned non-JSON:", text);
      }

      if (suggestedTitles.length === 0) {
        setFacts([]);
        setIsLoading(false);
        setProgress(100);
        return;
      }

      const titlesToFetch = suggestedTitles.slice(
        0,
        MAX_RESULTS_FROM_AUTOCOMPLETE
      );
      const fetchPromises = titlesToFetch.map((title) =>
        fetchFactByTitleFromApi(title)
      );

      const results = await Promise.allSettled(fetchPromises);

      const fetchedFactsMap = new Map<string, Fact>();
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          if (result.value.id) {
            fetchedFactsMap.set(result.value.id, result.value);
          }
        } else if (result.status === "rejected") {
          console.error("Failed to fetch one of the facts:", result.reason);
        }
      });

      const finalFacts = Array.from(fetchedFactsMap.values());
      setFacts(finalFacts);
    } catch (error) {
      console.error("Error during autocomplete search submit:", error);
      setError(
        error instanceof Error ? error.message : "Failed to perform search"
      );
      setFacts([]);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      setProgress(0);
      const startTime = Date.now();
      const duration = 1500;

      timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const calculatedProgress = Math.min(
          100,
          (elapsedTime / duration) * 100
        );
        setProgress(calculatedProgress);

        if (calculatedProgress >= 100) {
          if (timer) clearInterval(timer);
        }
      }, 50);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  return {
    facts,
    isLoading,
    error,
    progress,
    fetchRandomFacts,
    searchFactsByTitle,
    searchFactsFromAutocomplete,
    setFacts,
    setError,
    setIsLoading,
  };
}
