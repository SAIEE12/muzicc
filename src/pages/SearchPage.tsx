import { useState, useMemo } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { TrackRow } from "@/components/TrackRow";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchPage() {
  const { tracks } = usePlayer();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return tracks.filter(
      t => t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
    );
  }, [tracks, query]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-display font-bold mb-6">Search</h1>

      <div className="relative max-w-lg mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums..."
          className="pl-10 h-12 text-base bg-secondary border-none rounded-full"
          autoFocus
        />
      </div>

      {query.trim() ? (
        results.length > 0 ? (
          <div className="space-y-0.5">
            {results.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} queue={results} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-12">No results found for "{query}"</p>
        )
      ) : (
        <p className="text-muted-foreground text-center py-12">Start typing to search your library</p>
      )}
    </div>
  );
}
