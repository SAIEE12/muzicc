import { Track } from "@/types/music";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, Heart, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TrackRowProps {
  track: Track;
  index: number;
  queue?: Track[];
  showAlbum?: boolean;
}

function formatDuration(s: number) {
  if (!s) return "--:--";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function TrackRow({ track, index, queue, showAlbum = true }: TrackRowProps) {
  const { currentTrack, isPlaying, play, pause, toggleLike, likedTrackIds, playlists, addToPlaylist } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const isLiked = likedTrackIds.has(track.id);

  const handlePlay = () => {
    if (isActive && isPlaying) pause();
    else play(track, queue);
  };

  return (
    <div
      className={cn(
        "group grid items-center gap-4 px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
        showAlbum ? "grid-cols-[40px_1fr_1fr_40px_60px_32px]" : "grid-cols-[40px_1fr_40px_60px_32px]",
        isActive && "bg-accent/30"
      )}
      onDoubleClick={handlePlay}
    >
      {/* Index / Play */}
      <div className="flex items-center justify-center">
        <span className={cn("text-sm tabular-nums group-hover:hidden", isActive ? "text-primary" : "text-muted-foreground")}>
          {index + 1}
        </span>
        <button onClick={handlePlay} className="hidden group-hover:block text-foreground">
          {isActive && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
      </div>

      {/* Title & Artist */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded bg-secondary shrink-0 overflow-hidden flex items-center justify-center">
          {track.coverUrl ? <img src={track.coverUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-xs">🎵</span>}
        </div>
        <div className="min-w-0">
          <p className={cn("text-sm font-medium truncate", isActive && "text-primary")}>{track.title}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        </div>
      </div>

      {/* Album */}
      {showAlbum && <p className="text-sm text-muted-foreground truncate">{track.album || "—"}</p>}

      {/* Like */}
      <button onClick={() => toggleLike(track.id)} className="flex items-center justify-center">
        <Heart className={cn("w-4 h-4 transition-colors", isLiked ? "fill-primary text-primary" : "text-transparent group-hover:text-muted-foreground")} />
      </button>

      {/* Duration */}
      <span className="text-sm text-muted-foreground tabular-nums text-right">{formatDuration(track.duration)}</span>

      {/* More */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {playlists.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Add to playlist</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {playlists.map(pl => (
                  <DropdownMenuItem key={pl.id} onClick={() => addToPlaylist(pl.id, track.id)}>
                    {pl.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <DropdownMenuItem onClick={() => toggleLike(track.id)}>
            {isLiked ? "Remove from Liked" : "Add to Liked"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
