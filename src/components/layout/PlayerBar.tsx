import { usePlayer } from "@/contexts/PlayerContext";
import { Slider } from "@/components/ui/slider";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback } from "react";

function formatTime(s: number) {
  if (!s || !isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ── Vinyl Disc ── */
function VinylDisc({ coverUrl, isPlaying }: { coverUrl?: string; isPlaying: boolean }) {
  const discRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const speedRef = useRef(0); // current deg/frame at 60fps → target ~2 deg/frame for 3s revolution
  const rafRef = useRef<number>(0);
  const TARGET_SPEED = 2; // degrees per frame (~120 deg/s → 3s per rev)

  const animate = useCallback(() => {
    if (isPlaying) {
      // accelerate
      speedRef.current = Math.min(speedRef.current + 0.04, TARGET_SPEED);
    } else {
      // decelerate
      speedRef.current = Math.max(speedRef.current - 0.03, 0);
    }

    rotationRef.current = (rotationRef.current + speedRef.current) % 360;

    if (discRef.current) {
      discRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }

    if (speedRef.current > 0 || isPlaying) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  return (
    <div className="w-14 h-14 rounded-full relative shrink-0" style={{ background: "hsl(0 0% 8%)" }}>
      <div
        ref={discRef}
        className="w-full h-full rounded-full relative"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, transparent 28%, hsl(0 0% 14%) 29%, hsl(0 0% 10%) 31%, hsl(0 0% 14%) 33%, hsl(0 0% 10%) 35%, hsl(0 0% 14%) 44%, hsl(0 0% 10%) 46%, hsl(0 0% 14%) 48%, hsl(0 0% 8%) 49%, hsl(0 0% 8%) 100%),
            radial-gradient(circle at 35% 35%, hsl(0 0% 25% / 0.15) 0%, transparent 60%)
          `,
        }}
      >
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[38%] h-[38%] rounded-full overflow-hidden border border-muted-foreground/20" style={{ background: "hsl(25 20% 15%)" }}>
            {coverUrl ? (
              <img src={coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[8px]">🎵</span>
              </div>
            )}
          </div>
        </div>
        {/* Shine highlight */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(135deg, hsl(0 0% 100% / 0.06) 0%, transparent 40%, transparent 60%, hsl(0 0% 100% / 0.03) 100%)",
          }}
        />
      </div>
    </div>
  );
}

/* ── Brass Control Button ── */
function BrassButton({
  onClick, children, size = "md", active,
}: { onClick: () => void; children: React.ReactNode; size?: "sm" | "md" | "lg"; active?: boolean }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full flex items-center justify-center transition-all hover:brightness-110",
        sizeClasses[size],
        active ? "brass-button" : "bg-secondary border border-border hover:bg-accent"
      )}
    >
      {children}
    </button>
  );
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
      <div className="h-22 bg-player border-t border-border flex items-center justify-center wood-texture">
        <p className="text-sm text-muted-foreground italic font-body">No record on the turntable — upload some music to get started</p>
      </div>
    );
  }

  const isLiked = likedTrackIds.has(currentTrack.id);

  return (
    <div className="h-22 bg-player border-t border-border flex items-center px-4 gap-4 wood-texture">
      {/* Vinyl + Track info */}
      <div className="flex items-center gap-3 w-[280px] min-w-0">
        <VinylDisc coverUrl={currentTrack.coverUrl} isPlaying={isPlaying} />
        <div className="min-w-0">
          <p className="text-sm font-display font-semibold truncate">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground truncate italic">{currentTrack.artist}</p>
        </div>
        <button onClick={() => toggleLike(currentTrack.id)} className="ml-1 shrink-0">
          <Heart className={cn("w-4 h-4 transition-colors", isLiked ? "fill-primary text-primary" : "text-muted-foreground hover:text-foreground")} />
        </button>
      </div>

      {/* Controls */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-[600px]">
        <div className="flex items-center gap-3">
          <BrassButton onClick={toggleShuffle} size="sm" active={shuffle}>
            <Shuffle className={cn("w-3.5 h-3.5", shuffle ? "text-primary-foreground" : "text-muted-foreground")} />
          </BrassButton>
          <BrassButton onClick={previous} size="md">
            <SkipBack className="w-4 h-4 fill-current text-foreground" />
          </BrassButton>
          <BrassButton onClick={togglePlay} size="lg" active>
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-primary-foreground" />
            ) : (
              <Play className="w-5 h-5 fill-current text-primary-foreground ml-0.5" />
            )}
          </BrassButton>
          <BrassButton onClick={next} size="md">
            <SkipForward className="w-4 h-4 fill-current text-foreground" />
          </BrassButton>
          <BrassButton onClick={toggleRepeat} size="sm" active={repeat !== "off"}>
            {repeat === "one" ? (
              <Repeat1 className="w-3.5 h-3.5 text-primary-foreground" />
            ) : (
              <Repeat className={cn("w-3.5 h-3.5", repeat !== "off" ? "text-primary-foreground" : "text-muted-foreground")} />
            )}
          </BrassButton>
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
