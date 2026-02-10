import { useState, useMemo } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { TrackRow } from "@/components/TrackRow";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Track } from "@/types/music";

type SortBy = "recent" | "title" | "artist" | "album";

export default function LibraryPage() {
  const { tracks, play } = usePlayer();
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const sorted = useMemo(() => {
    const arr = [...tracks];
    switch (sortBy) {
      case "recent": return arr.sort((a, b) => b.addedAt - a.addedAt);
      case "title": return arr.sort((a, b) => a.title.localeCompare(b.title));
      case "artist": return arr.sort((a, b) => a.artist.localeCompare(b.artist));
      case "album": return arr.sort((a, b) => (a.album || "").localeCompare(b.album || ""));
    }
  }, [tracks, sortBy]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold">Your Library</h1>
        <div className="flex items-center gap-2">
          {(["recent", "title", "artist", "album"] as SortBy[]).map(s => (
            <Button key={s} variant={sortBy === s ? "secondary" : "ghost"} size="sm" onClick={() => setSortBy(s)} className="capitalize text-xs">
              {s}
            </Button>
          ))}
          <div className="ml-2 flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode("list")} className={cn("p-1.5", viewMode === "list" ? "bg-accent" : "")}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5", viewMode === "grid" ? "bg-accent" : "")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {tracks.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">Your library is empty. Upload some tracks first!</p>
      ) : viewMode === "list" ? (
        <div className="space-y-0.5">
          {sorted.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} queue={sorted} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sorted.map((track) => (
            <GridCard key={track.id} track={track} onClick={() => play(track, sorted)} />
          ))}
        </div>
      )}
    </div>
  );
}

function GridCard({ track, onClick }: { track: Track; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group bg-card hover:bg-accent/60 rounded-xl p-3 text-left transition-colors"
    >
      <div className="aspect-square rounded-lg bg-secondary mb-3 overflow-hidden">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
        )}
      </div>
      <p className="text-sm font-medium truncate">{track.title}</p>
      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
    </button>
  );
}
