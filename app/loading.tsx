"use client";

import { Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
      <div className="bg-background/80 p-4 rounded-2xl shadow-lg border border-default-100">
        <Spinner size="lg" color="primary" label="Loading..." />
      </div>
    </div>
  );
}
