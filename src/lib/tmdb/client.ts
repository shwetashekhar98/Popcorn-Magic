const TMDB_BASE = "https://api.themoviedb.org/3";

interface FetchOptions {
  revalidate?: number | false;
  cache?: RequestCache;
  searchParams?: Record<string, string | number | undefined>;
}

export async function tmdbFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_READ_ACCESS_TOKEN is not set");

  const url = new URL(`${TMDB_BASE}${path}`);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const fetchOptions: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (options.cache) {
    fetchOptions.cache = options.cache;
  } else if (options.revalidate !== undefined) {
    fetchOptions.next = { revalidate: options.revalidate as number };
  } else {
    fetchOptions.next = { revalidate: 3600 };
  }

  const res = await fetch(url.toString(), fetchOptions);
  if (!res.ok) {
    throw new Error(`TMDb error ${res.status}: ${res.statusText} — ${path}`);
  }
  return res.json() as Promise<T>;
}
