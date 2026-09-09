"use client";

import { useId, useRef, useState } from "react";
import { errorTextClass, inputClass, secondaryButtonClass } from "./styles";

interface ImageFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  required?: boolean;
}

/**
 * A URL input with an "Upload" button next to it. Picking a file POSTs it to
 * /api/admin/upload (Cloudinary) and drops the resulting URL into the text
 * input, which stays editable so an existing URL can also be pasted.
 */
const ImageField = ({ name, label, value, onChange, error, required }: ImageFieldProps) => {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const payload = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? `Upload failed (${response.status})`);
      }
      onChange(payload.url);
    } catch (cause) {
      setUploadError(cause instanceof Error ? cause.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const message = uploadError ?? error;

  return (
    <div className="flex flex-col gap-1 text-sm dark:text-slate-200">
      <label htmlFor={inputId}>{label}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        {value ? (
          <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary pasted URL */}
            <img src={value} alt="" className="w-full h-full object-contain" />
          </div>
        ) : null}
        <div className="flex-1 flex flex-col gap-2">
          <input
            id={inputId}
            type="text"
            name={name}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://res.cloudinary.com/..."
            required={required}
            className={inputClass}
            aria-invalid={message ? true : undefined}
          />
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <button
              type="button"
              className={secondaryButtonClass}
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Uploading..." : "Upload image"}
            </button>
            {value ? (
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => onChange("")}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {message ? (
        <p role="alert" className={errorTextClass}>
          {message}
        </p>
      ) : null}
    </div>
  );
};

export default ImageField;
