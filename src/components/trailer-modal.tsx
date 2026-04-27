"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { Video } from "@/lib/tmdb/types";

interface Props {
  videos: Video[];
}

export function TrailerModal({ videos }: Props) {
  const [open, setOpen] = useState(false);

  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ??
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos.find((v) => v.site === "YouTube");

  if (!trailer) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Play className="h-4 w-4" />
        Watch Trailer
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Trailer</DialogTitle>
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title={trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
