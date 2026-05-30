"use client";

import { useState, useRef } from "react";
import { uploadFile } from "../../lib/api";
import { useToast } from "./ToastProvider";

interface ImageUploaderProps {
  label: string;
  currentUrl?: string;
  tenantSlug: string;
  folder: string; // 'logo' | 'projects' | 'team'
  onUploaded: (url: string) => void;
  aspectRatio?: string;
  hint?: string;
}

export function ImageUploader({
  label,
  currentUrl,
  tenantSlug,
  folder,
  onUploaded,
  aspectRatio = "16/9",
  hint,
}: ImageUploaderProps) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("Image must be under 10MB", "error");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(30);

    try {
      setProgress(60);
      const { url } = await uploadFile(file, tenantSlug, folder);
      setProgress(100);
      setPreview(url);
      onUploaded(url);
      showToast(`${label} uploaded successfully`, "success");
    } catch {
      showToast("Upload failed. Please try again.", "error");
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="form-group full">
      <label className="form-label">{label}</label>

      {preview ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              aspectRatio,
              width: aspectRatio === "1/1" ? "100px" : "180px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #2a2a2a",
              flexShrink: 0,
            }}
          >
            <img
              src={preview}
              alt={label}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#f4a61d",
                }}
              >
                Uploading...
              </div>
            )}
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Change image
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setPreview(null);
                onUploaded("");
              }}
              disabled={uploading}
            >
              Remove
            </button>
            {hint && <p style={{ fontSize: "11px", color: "#555" }}>{hint}</p>}
          </div>
          {uploading && (
            <div className="progress-bar" style={{ width: "100%" }}>
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
          />
        </div>
      ) : (
        <div
          className={`uploader${dragOver ? " drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <div className="uploader-icon">{uploading ? "⏳" : "🖼️"}</div>
          <div className="uploader-text">
            {uploading ? "Uploading..." : "Click or drag image here"}
          </div>
          <div className="uploader-sub">
            {hint || "PNG, JPG, WebP — max 10MB"}
          </div>
          {uploading && (
            <div
              className="progress-bar"
              style={{
                marginTop: "1rem",
                width: "200px",
                margin: "1rem auto 0",
              }}
            >
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
