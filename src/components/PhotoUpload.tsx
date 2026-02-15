"use client";

import { useRef, useCallback } from "react";

interface PhotoUploadProps {
  photo: string | null;
  onChange: (dataUrl: string | null) => void;
  uploadLabel: string;
  changeLabel: string;
}

export default function PhotoUpload({ photo, onChange, uploadLabel, changeLabel }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 800;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;

        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);

        let quality = 0.8;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > 500 * 1024 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        onChange(dataUrl);
      };
      img.src = URL.createObjectURL(file);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col items-center gap-3">
      {photo && (
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/20 transition"
      >
        {photo ? changeLabel : uploadLabel}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
