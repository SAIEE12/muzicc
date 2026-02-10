import { usePlayer } from "@/contexts/PlayerContext";
import { Slider } from "@/components/ui/slider";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatTime(s: number) {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentTrack, isPlaying, currentTime, duration, volume,
    shuffle, repeat, likedTrackIds,
    togglePlay, next, previous, seek, setVolume,
    toggleShuffle, toggleRepeat, toggleLike,
  } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="h-20 bg-player border-t border-border flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No track selected — upload some music to get started</p>
      </div>
    );
  }

  const isLiked = likedTrackIds.has(currentTrack.id);

  return (
    <div className="h-20 bg-player border-t border-border flex items-center px-4 gap-4">
      {/* Track info */}
      <div className="flex items-center gap-3 w-[280px] min-w-0">
        <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
          {currentTrack.coverUrl ? (
            <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">🎵</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
        </div>
        <button onClick={() => toggleLike(currentTrack.id)} className="ml-1 shrink-0">
          <Heart className={cn("w-4 h-4 transition-colors", isLiked ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground")} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-[600px]">
        <div className="flex items-center gap-4">
          <button onClick={toggleShuffle} className={cn("transition-colors", shuffle ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Shuffle className="w-4 h-4" />
          </button>
          <button onClick={previous} className="text-foreground hover:text-primary transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button onClick={next} className="text-foreground hover:text-primary transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button onClick={toggleRepeat} className={cn("transition-colors", repeat !== "off" ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            {repeat === "one" ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-[11px] text-muted-foreground w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={([v]) => seek(v)}
            className="flex-1"
          />
          <span className="text-[11px] text-muted-foreground w-10 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-[160px] justify-end">
        <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)} className="text-muted-foreground hover:text-foreground transition-colors">
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={([v]) => setVolume(v)}
          className="w-24"
        />
      </div>
    </div>
  );
}
