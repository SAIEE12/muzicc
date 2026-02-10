import { Home, Search, Library, ListMusic, Heart, Upload } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";

const mainNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
  { title: "Library", url: "/library", icon: Library },
  { title: "Upload", url: "/upload", icon: Upload },
];

export function AppSidebar() {
  const { playlists } = usePlayer();

  return (
    <aside className="flex flex-col w-60 shrink-0 bg-sidebar h-full overflow-hidden">
      {/* Logo */}
      <div className="p-6 pb-4">
        <h1 className="text-xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ListMusic className="w-4 h-4 text-primary-foreground" />
          </span>
          Resonance
        </h1>
      </div>

      {/* Main nav */}
      <nav className="px-3 space-y-1">
        {mainNav.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-foreground"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mx-5 my-4 border-t border-sidebar-border" />

      {/* Playlists */}
      <div className="px-3 flex-1 overflow-y-auto">
        <NavLink
          to="/liked"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          activeClassName="bg-sidebar-accent text-foreground"
        >
          <span className="w-5 h-5 rounded bg-gradient-to-br from-purple-600 to-blue-400 flex items-center justify-center">
            <Heart className="w-3 h-3 text-white fill-white" />
          </span>
          <span>Liked Songs</span>
        </NavLink>

        {playlists.map((pl) => (
          <NavLink
            key={pl.id}
            to={`/playlist/${pl.id}`}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors truncate"
            activeClassName="bg-sidebar-accent text-foreground"
          >
            <ListMusic className="w-4 h-4 shrink-0 opacity-60" />
            <span className="truncate">{pl.name}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
