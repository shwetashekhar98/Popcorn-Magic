"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-32 text-center space-y-4">
      <h2 className="text-2xl font-bold">Could not load TV show</h2>
      <p className="text-muted-foreground">This show may not exist or the request failed.</p>
      <Link href="/"><Button>Back to Home</Button></Link>
    </div>
  );
}
