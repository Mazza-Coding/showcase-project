import { useState, useCallback, useRef, useEffect } from "react";
import { debounce, DebouncedFunction } from "../utils";

export function useAutocomplete(debounceWait = 300) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  const autocompleteAbortControllerRef = useRef<AbortController | null>(null);
  const autocompleteCacheRef = useRef<Map<string, string[]>>(new Map());
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const fetchAutocompleteCallback = useCallback(
    async (query: string, signal: AbortSignal) => {
      if (query.length < 1) {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsAutocompleteLoading(false);
        autocompleteAbortControllerRef.current = null;
        return;
      }

      if (autocompleteCacheRef.current.has(query)) {
        const cachedSuggestions = autocompleteCacheRef.current.get(query)!;
        setSuggestions(cachedSuggestions);
        setShowSuggestions(cachedSuggestions.length > 0);
        setIsAutocompleteLoading(false);
        autocompleteAbortControllerRef.current = null;
        return;
      }

      try {
        const response = await fetch(
          `/api/facts/autocomplete?partial=${encodeURIComponent(query)}`,
          { signal }
        );

        if (signal.aborted) return;

        if (!response.ok) {
          console.error(`Autocomplete error: ${response.status}`);
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const data: string[] = await response.json();
          autocompleteCacheRef.current.set(query, data);
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        } else {
          const text = await response.text();
          console.error("Autocomplete received non-JSON response:", text);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          console.log("Autocomplete fetch aborted for query:", query);
        } else {
          console.error("Failed to fetch autocomplete:", error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (!signal.aborted) {
          setIsAutocompleteLoading(false);
        }
      }
    },
    []
  );

  const debouncedFetchAutocomplete = useRef<
    DebouncedFunction<typeof fetchAutocompleteCallback>
  >(debounce(fetchAutocompleteCallback, debounceWait));

  const triggerAutocompleteFetch = useCallback((query: string) => {
    debouncedFetchAutocomplete.current.cancel();

    if (autocompleteAbortControllerRef.current) {
      autocompleteAbortControllerRef.current.abort();
    }

    if (query.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsAutocompleteLoading(false);
      autocompleteAbortControllerRef.current = null;
      return;
    }

    if (autocompleteCacheRef.current.has(query)) {
      const cachedSuggestions = autocompleteCacheRef.current.get(query)!;
      setSuggestions(cachedSuggestions);
      setShowSuggestions(cachedSuggestions.length > 0);
      setIsAutocompleteLoading(false);
      autocompleteAbortControllerRef.current = null;
      return;
    }

    autocompleteAbortControllerRef.current = new AbortController();
    const signal = autocompleteAbortControllerRef.current.signal;

    setIsAutocompleteLoading(true);
    setSuggestions([]);
    setShowSuggestions(false);
    debouncedFetchAutocomplete.current(query, signal);
  }, []);

  const cancelAutocomplete = useCallback(() => {
    debouncedFetchAutocomplete.current.cancel();
    if (autocompleteAbortControllerRef.current) {
      autocompleteAbortControllerRef.current.abort();
    }
    setIsAutocompleteLoading(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]); // Dependency is the ref itself

  return {
    searchQuery,
    setSearchQuery,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
    isAutocompleteLoading,
    setIsAutocompleteLoading,
    triggerAutocompleteFetch,
    cancelAutocomplete,
    searchContainerRef,
  };
}
