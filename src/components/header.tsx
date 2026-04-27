import Link from "next/link";
import { Popcorn } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons } from "@/components/auth-buttons";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Popcorn className="h-6 w-6 text-yellow-500" />
          <span>Popcorn Magic</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
            Search
          </Link>
          <Link href="/favorites" className="text-muted-foreground hover:text-foreground transition-colors">
            Favorites
          </Link>
          <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
            Profile
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
