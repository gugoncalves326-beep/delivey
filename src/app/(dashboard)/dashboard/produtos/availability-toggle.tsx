"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleProductAvailability } from "./actions";

export function AvailabilityToggle({ id, isAvailable }: { id: string; isAvailable: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={isAvailable}
      disabled={pending}
      onChange={(next) => {
        const formData = new FormData();
        formData.set("id", id);
        formData.set("next", String(next));
        startTransition(() => toggleProductAvailability(formData));
      }}
    />
  );
}
