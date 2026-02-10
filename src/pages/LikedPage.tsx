import { useMemo } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { TrackRow } from "@/components/TrackRow";
import { Heart } from "lucide-react";

export default function LikedPage() {
  const { tracks, likedTrackIds } = usePlayer();

  const likedTracks = useMemo(() => tracks.filter(t => likedTrackIds.has(t.id)), [tracks, likedTrackIds]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-blue-400 flex items-center justify-center">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Liked Songs</h1>
          <p className="text-muted-foreground">{likedTracks.length} song{likedTracks.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {likedTracks.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Songs you like will appear here</p>
      ) : (
        <div className="space-y-0.5">
          {likedTracks.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} queue={likedTracks} />
          ))}
        </div>
      )}
    </div>
  );
}
