

# 🎵 Spotify-Style Music Player App

## Overview
A full-featured, dark-themed music streaming app where users can upload their own music, build playlists, and enjoy a polished listening experience — inspired by Spotify's design and UX.

---

## 1. User Authentication
- **Sign up / Login** with email & password
- User profile with display name and avatar
- Persistent sessions so users stay logged in

## 2. Music Upload & Storage
- Upload MP3 files with metadata (title, artist, album, genre)
- Upload album/cover art for each track
- Files stored securely in cloud storage (Supabase Storage)
- Track metadata stored in the database

## 3. Music Player
- Persistent bottom player bar (always visible while browsing)
- Play, pause, skip forward/back, shuffle, repeat
- Seek bar with current time / duration
- Volume control slider
- Album art display with track info (title, artist)
- Smooth transitions between tracks

## 4. Library & Browse
- **Library page**: View all uploaded songs organized by recent, artist, album, or genre
- **Browse/Discover page**: See all available music in the library
- Grid and list view options for browsing

## 5. Search
- Search songs by title, artist, album, or genre
- Real-time search results as you type
- Click to play directly from search results

## 6. Playlists
- Create, rename, and delete playlists
- Add/remove songs to playlists
- Drag-and-drop reordering within playlists
- Playlist cover art (auto-generated from first few tracks)

## 7. Favorites / Liked Songs
- Heart/like button on any track
- Dedicated "Liked Songs" auto-playlist

## 8. Design & UI
- **Dark theme** with vibrant accent colors (Spotify-inspired)
- Sidebar navigation (Home, Search, Library, Playlists)
- Responsive layout for desktop and tablet
- Smooth animations and hover effects
- Album art prominently featured throughout

## 9. Backend (Lovable Cloud + Supabase)
- Database tables for users, profiles, songs, playlists, playlist_songs, and liked_songs
- Supabase Storage bucket for audio files and cover art
- Row-level security so users manage only their own data
- User roles table for future admin capabilities

