"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Camera, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AvatarUpload({
  name,
  avatarUrl,
  onUploaded,
  size = "size-12",
  editable = true,
}: {
  name: string;
  avatarUrl?: string;
  onUploaded: (url: string) => void;
  size?: string;
  /** False when there's no saved profile row yet to attach a custom photo
   * to — shows the photo read-only instead of an upload control. */
  editable?: boolean;
}) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Image must be under 4MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust — the path (and therefore the URL) stays the same when
      // replacing a photo, so without this the browser/CDN would keep
      // showing the old cached image.
      const url = `${data.publicUrl}?v=${Date.now()}`;

      const response = await fetch("/api/seeker-candidates/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      });
      if (!response.ok) throw new Error("save_failed");

      setPreview(url);
      onUploaded(url);
    } catch {
      setError("Could not upload photo. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <Avatar className={size}>
          {preview && <AvatarImage src={preview} alt={name} />}
          <AvatarFallback className="text-base">
            {initialsFor(name) || <UserRound className="size-5" />}
          </AvatarFallback>
        </Avatar>
        {editable && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              aria-label="Change photo"
              className={cn(
                "absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted disabled:opacity-50"
              )}
            >
              <Camera className="size-3.5" />
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleFile(event)}
            />
          </>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
