export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
        <p>
          Movie & TV data provided by{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            TMDb
          </a>
          . Built for NYU LeetCode Bootcamp.
        </p>
      </div>
    </footer>
  );
}
