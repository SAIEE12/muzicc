import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { Track, Playlist, RepeatMode } from "@/types/music";

interface PlayerState {
  tracks: Track[];
  playlists: Playlist[];
  likedTrackIds: Set<string>;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Track[];
  queueIndex: number;
}

interface PlayerContextType extends PlayerState {
  play: (track?: Track, queue?: Track[]) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addTracks: (tracks: Track[]) => void;
  removeTrack: (id: string) => void;
  toggleLike: (id: string) => void;
  createPlaylist: (name: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylist: (playlistId: string, trackIds: string[]) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEYS = {
  tracks: "musicapp_tracks",
  playlists: "musicapp_playlists",
  liked: "musicapp_liked",
  volume: "musicapp_volume",
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [tracks, setTracks] = useState<Track[]>(() => loadFromStorage(STORAGE_KEYS.tracks, []));
  const [playlists, setPlaylists] = useState<Playlist[]>(() => loadFromStorage(STORAGE_KEYS.playlists, []));
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => new Set(loadFromStorage<string[]>(STORAGE_KEYS.liked, [])));
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => loadFromStorage(STORAGE_KEYS.volume, 0.7));
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);

  // Persist to localStorage
  useEffect(() => { saveToStorage(STORAGE_KEYS.tracks, tracks); }, [tracks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.playlists, playlists); }, [playlists]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.liked, Array.from(likedTrackIds)); }, [likedTrackIds]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.volume, volume); }, [volume]);

  // Init audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("durationchange", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => handleTrackEnd());

    return () => { audio.pause(); audio.src = ""; };
  }, []);

  const handleTrackEnd = useCallback(() => {
    if (repeat === "one") {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play(); }
      return;
    }
    // Will call next() but we need the latest state
    nextRef.current?.();
  }, [repeat]);

  // Keep handleTrackEnd in sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handler = () => handleTrackEnd();
    audio.addEventListener("ended", handler);
    return () => audio.removeEventListener("ended", handler);
  }, [handleTrackEnd]);

  const nextRef = useRef<(() => void) | null>(null);

  const play = useCallback((track?: Track, newQueue?: Track[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (track) {
      if (newQueue) {
        const idx = newQueue.findIndex(t => t.id === track.id);
        setQueue(newQueue);
        setQueueIndex(idx >= 0 ? idx : 0);
      }
      setCurrentTrack(track);
      audio.src = track.fileUrl;
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else if (currentTrack) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, pause, play]);

  const getNextIndex = useCallback((currentIdx: number, q: Track[]) => {
    if (q.length === 0) return -1;
    if (shuffle) {
      let nextIdx = Math.floor(Math.random() * q.length);
      if (q.length > 1) while (nextIdx === currentIdx) nextIdx = Math.floor(Math.random() * q.length);
      return nextIdx;
    }
    const nextIdx = currentIdx + 1;
    if (nextIdx >= q.length) return repeat === "all" ? 0 : -1;
    return nextIdx;
  }, [shuffle, repeat]);

  const next = useCallback(() => {
    const nextIdx = getNextIndex(queueIndex, queue);
    if (nextIdx >= 0 && queue[nextIdx]) {
      setQueueIndex(nextIdx);
      play(queue[nextIdx]);
    } else {
      pause();
    }
  }, [queueIndex, queue, getNextIndex, play, pause]);

  nextRef.current = next;

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0 && queue[prevIdx]) {
      setQueueIndex(prevIdx);
      play(queue[prevIdx]);
    }
  }, [queueIndex, queue, play]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const toggleRepeat = useCallback(() => setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off"), []);

  const addTracks = useCallback((newTracks: Track[]) => {
    setTracks(prev => [...prev, ...newTracks]);
  }, []);

  const removeTrack = useCallback((id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    setPlaylists(prev => prev.map(p => ({ ...p, trackIds: p.trackIds.filter(tid => tid !== id) })));
    setLikedTrackIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLikedTrackIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }, []);

  const createPlaylist = useCallback((name: string): Playlist => {
    const p: Playlist = { id: crypto.randomUUID(), name, trackIds: [], createdAt: Date.now() };
    setPlaylists(prev => [...prev, p]);
    return p;
  }, []);

  const deletePlaylist = useCallback((id: string) => setPlaylists(prev => prev.filter(p => p.id !== id)), []);
  const renamePlaylist = useCallback((id: string, name: string) => setPlaylists(prev => prev.map(p => p.id === id ? { ...p, name } : p)), []);
  const addToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId && !p.trackIds.includes(trackId) ? { ...p, trackIds: [...p.trackIds, trackId] } : p));
  }, []);
  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, trackIds: p.trackIds.filter(id => id !== trackId) } : p));
  }, []);
  const reorderPlaylist = useCallback((playlistId: string, trackIds: string[]) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, trackIds } : p));
  }, []);

  return (
    <PlayerContext.Provider value={{
      tracks, playlists, likedTrackIds, currentTrack, isPlaying, currentTime, duration,
      volume, shuffle, repeat, queue, queueIndex,
      play, pause, togglePlay, next, previous, seek, setVolume,
      toggleShuffle, toggleRepeat, addTracks, removeTrack, toggleLike,
      createPlaylist, deletePlaylist, renamePlaylist, addToPlaylist, removeFromPlaylist, reorderPlaylist,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
