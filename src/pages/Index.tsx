import { usePlayer } from "@/contexts/PlayerContext";
import { TrackRow } from "@/components/TrackRow";
import { Link } from "react-router-dom";
import { Upload, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { tracks } = usePlayer();

  const recentTracks = [...tracks].sort((a, b) => b.addedAt - a.addedAt).slice(0, 20);

  return (
    <div className="p-6 pb-4">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">Good evening</h1>
        <p className="text-muted-foreground">Welcome back to Resonance</p>
      </header>

      {tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center">
            <ListMusic className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-display font-semibold">No music yet</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Upload your first tracks to start building your personal music library.
          </p>
          <Button asChild className="mt-2">
            <Link to="/upload"><Upload className="w-4 h-4 mr-2" />Upload Music</Link>
          </Button>
        </div>
      ) : (
        <section>
          <h2 className="text-xl font-display font-semibold mb-4">Recently Added</h2>
          <div className="space-y-0.5">
            {recentTracks.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} queue={recentTracks} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;
