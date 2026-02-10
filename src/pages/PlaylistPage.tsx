import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/PlayerContext";
import { TrackRow } from "@/components/TrackRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Trash2, Pencil, ListMusic } from "lucide-react";

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, tracks, play, deletePlaylist, renamePlaylist } = usePlayer();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const playlist = playlists.find(p => p.id === id);
  const playlistTracks = useMemo(() => {
    if (!playlist) return [];
    return playlist.trackIds.map(tid => tracks.find(t => t.id === tid)).filter(Boolean) as typeof tracks;
  }, [playlist, tracks]);

  if (!playlist) {
    return <div className="p-6"><p className="text-muted-foreground">Playlist not found</p></div>;
  }

  const handleRename = () => {
    if (editName.trim()) renamePlaylist(playlist.id, editName.trim());
    setEditing(false);
  };

  const handleDelete = () => {
    deletePlaylist(playlist.id);
    navigate("/");
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
          <ListMusic className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="flex-1">
          {editing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleRename(); }} className="flex items-center gap-2">
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="h-8 max-w-xs" />
              <Button size="sm" type="submit">Save</Button>
            </form>
          ) : (
            <h1 className="text-3xl font-display font-bold">{playlist.name}</h1>
          )}
          <p className="text-muted-foreground">{playlistTracks.length} song{playlistTracks.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          {playlistTracks.length > 0 && (
            <Button size="sm" onClick={() => play(playlistTracks[0], playlistTracks)}>
              <Play className="w-4 h-4 mr-1 fill-current" /> Play
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => { setEditName(playlist.name); setEditing(true); }}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {playlistTracks.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">This playlist is empty — add songs from your library</p>
      ) : (
        <div className="space-y-0.5">
          {playlistTracks.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} queue={playlistTracks} />
          ))}
        </div>
      )}
    </div>
  );
}
