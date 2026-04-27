"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Props {
  defaultValue?: string;
}

export function SearchBar({ defaultValue = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const updateURL = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL(value);
    }, 400);
    return () => clearTimeout(timer);
  }, [value, updateURL]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search movies & TV shows…"
        className="pl-9"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search"
      />
    </div>
  );
}
