import { useState, useRef } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Track } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Music, X, Check } from "lucide-react";
import { toast } from "sonner";

interface PendingTrack {
  file: File;
  title: string;
  artist: string;
  album: string;
  genre: string;
  coverFile?: File;
  coverPreview?: string;
  duration: number;
}

export default function UploadPage() {
  const { addTracks } = usePlayer();
  const [pending, setPending] = useState<PendingTrack[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const newPending: PendingTrack[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("audio/")) continue;
      const duration = await getAudioDuration(file);
      const name = file.name.replace(/\.[^/.]+$/, "");
      const parts = name.includes(" - ") ? name.split(" - ") : [name];
      newPending.push({
        file,
        title: parts.length > 1 ? parts[1].trim() : parts[0].trim(),
        artist: parts.length > 1 ? parts[0].trim() : "Unknown Artist",
        album: "",
        genre: "",
        duration,
      });
    }
    setPending(prev => [...prev, ...newPending]);
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener("loadedmetadata", () => resolve(audio.duration));
      audio.addEventListener("error", () => resolve(0));
      audio.src = URL.createObjectURL(file);
    });
  };

  const updatePending = (index: number, updates: Partial<PendingTrack>) => {
    setPending(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  const handleCover = (index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    updatePending(index, { coverFile: file, coverPreview: preview });
  };

  const removePending = (index: number) => {
    setPending(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const newTracks: Track[] = pending.map(p => ({
      id: crypto.randomUUID(),
      title: p.title || "Untitled",
      artist: p.artist || "Unknown Artist",
      album: p.album,
      genre: p.genre,
      duration: p.duration,
      fileUrl: URL.createObjectURL(p.file),
      coverUrl: p.coverPreview,
      addedAt: Date.now(),
    }));
    addTracks(newTracks);
    setPending([]);
    toast.success(`Added ${newTracks.length} track${newTracks.length > 1 ? "s" : ""} to your library`);
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-1">Upload Music</h1>
      <p className="text-muted-foreground mb-6">Add MP3 files to your local library</p>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors cursor-pointer mb-8"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Drag & drop audio files or <span className="text-primary font-medium">browse</span></p>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Pending tracks */}
      {pending.length > 0 && (
        <div className="space-y-4">
          {pending.map((p, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-start gap-4">
                {/* Cover */}
                <label className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center cursor-pointer shrink-0 overflow-hidden hover:opacity-80 transition-opacity">
                  {p.coverPreview ? (
                    <img src={p.coverPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-6 h-6 text-muted-foreground" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleCover(i, e.target.files[0])} />
                </label>

                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <Input value={p.title} onChange={(e) => updatePending(i, { title: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Artist</Label>
                    <Input value={p.artist} onChange={(e) => updatePending(i, { artist: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Album</Label>
                    <Input value={p.album} onChange={(e) => updatePending(i, { album: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Genre</Label>
                    <Input value={p.genre} onChange={(e) => updatePending(i, { genre: e.target.value })} className="h-8 text-sm" />
                  </div>
                </div>

                <button onClick={() => removePending(i)} className="text-muted-foreground hover:text-destructive transition-colors mt-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setPending([])}>Clear All</Button>
            <Button onClick={handleSubmit}>
              <Check className="w-4 h-4 mr-2" />
              Add {pending.length} Track{pending.length > 1 ? "s" : ""} to Library
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
