import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Dices, Bird, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import FactCard from "./components/FactCard";
import { Fact } from "./types.ts";
import { useFactData } from "./hooks/useFactData";
import { useAutocomplete } from "./hooks/useAutocomplete";

const Home = () => {
  const {
    facts,
    isLoading,
    error,
    progress,
    fetchRandomFacts,
    searchFactsByTitle,
    searchFactsFromAutocomplete,
  } = useFactData();

  const {
    searchQuery,
    setSearchQuery,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isAutocompleteLoading,
    triggerAutocompleteFetch,
    cancelAutocomplete,
    searchContainerRef,
  } = useAutocomplete();

  useEffect(() => {
    if (!searchQuery) {
      fetchRandomFacts(4);
    }
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    triggerAutocompleteFetch(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    cancelAutocomplete();
    searchFactsByTitle(suggestion);
  };

  const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    cancelAutocomplete();
    searchFactsFromAutocomplete(searchQuery);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (!searchQuery.trim()) return;
      setShowSuggestions(false);
      cancelAutocomplete();
      searchFactsFromAutocomplete(searchQuery);
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
      cancelAutocomplete();
    }
  };

  const handleInputFocus = () => {
    if (
      searchQuery.length >= 1 &&
      suggestions.length > 0 &&
      !isAutocompleteLoading
    ) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-16">
      <div ref={searchContainerRef} className="relative mb-8 w-full max-w-md">
        <form
          onSubmit={handleSearchFormSubmit}
          className="flex items-center space-x-2 w-full"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
            <Input
              type="search"
              placeholder="Search facts..."
              className="pl-8 w-full peer pr-10"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={handleInputFocus}
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="suggestions-list"
              aria-expanded={
                showSuggestions &&
                suggestions.length > 0 &&
                !isAutocompleteLoading
              }
              aria-busy={isAutocompleteLoading}
            />
            {isAutocompleteLoading && (
              <div className="absolute right-2.5 top-0 bottom-0 flex items-center pr-3 z-10">
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer flex-shrink-0"
            onClick={() => fetchRandomFacts(4)}
            title="Get random facts"
            type="button"
          >
            <Dices className="h-4 w-4" />
          </Button>
        </form>

        {showSuggestions &&
          suggestions.length > 0 &&
          !isAutocompleteLoading && (
            <ul
              id="suggestions-list"
              className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-background border border-border rounded-md shadow-lg z-50"
              role="listbox"
              aria-label="Fact suggestions"
            >
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-3 py-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSuggestionClick(suggestion);
                    }
                  }}
                  role="option"
                  aria-selected="false"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
      </div>

      <div className="w-full max-w-4xl relative">
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 pt-10">
            <Bird className="h-8 w-8 animate-bounce text-primary" />
            <Progress value={progress} className="w-1/2 mt-2" />
          </div>
        )}
        {error && (
          <p className="text-center text-red-500 pt-10">Error: {error}</p>
        )}
        {!isLoading && !error && (
          <>
            {facts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
                {facts.map((fact: Fact) => (
                  <FactCard key={fact.id} fact={fact} />
                ))}
              </div>
            ) : searchQuery ? (
              <p className="text-center text-muted-foreground pt-10">
                No facts found matching "{searchQuery}".
              </p>
            ) : (
              !isLoading &&
              !error &&
              !searchQuery &&
              facts.length === 0 && (
                <p className="text-center text-muted-foreground pt-10">
                  Click the dice to get random facts!
                </p>
              )
            )}
          </>
        )}
        {!isLoading && facts.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};

export default Home;
