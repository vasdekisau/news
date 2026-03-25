"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.vasdekis.com.au";

interface PDF {
  id: string;
  filename: string;
  summary: string;
  added_at: number;
  content?: string;
  images?: string;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function PDFs() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<PDF | null>(null);
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPdfs();
  }, []);

  async function fetchPdfs() {
    try {
      const res = await fetch(`${API_BASE}/api/pdfs`);
      const data = await res.json();
      setPdfs(data.pdfs || []);
    } catch (err) {
      console.error("Failed to fetch PDFs:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file");
      setUploadStatus("error");
      return;
    }

    uploadFile(file);
  }

  async function uploadFile(file: File) {
    setUploadStatus("uploading");
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/pdfs`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${res.status}`);
      }

      setUploadStatus("success");
      await fetchPdfs();

      setTimeout(() => {
        setUploadStatus("idle");
      }, 3000);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setUploadStatus("error");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function viewPdfContent(pdf: PDF) {
    setSelectedPdf(pdf);
    setPdfContent(null);
    setPdfImages([]);
    setContentLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/pdfs/${pdf.id}`);
      if (!res.ok) throw new Error("Failed to fetch PDF content");
      const data = await res.json();
      setPdfContent(data.content || "No content extracted");
      if (data.images) {
        try {
          const imageKeys = JSON.parse(data.images) as string[];
          setPdfImages(imageKeys);
        } catch {
          setPdfImages([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch PDF content:", err);
      setPdfContent("Failed to load content");
    } finally {
      setContentLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">PDFs</h1>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus === "uploading"}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            >
              {uploadStatus === "uploading" ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload PDF
                </>
              )}
            </button>
          </div>
        </div>

        {uploadStatus === "success" && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-600 text-sm">
            PDF uploaded successfully
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
            {uploadError || "Upload failed"}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : pdfs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">No PDFs yet</p>
            <p className="text-sm text-muted-foreground">
              Upload a PDF or connect Google Drive to sync
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pdfs.map((pdf) => (
              <button
                key={pdf.id}
                onClick={() => viewPdfContent(pdf)}
                className="w-full text-left bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
              >
                <h3 className="font-semibold">{pdf.filename}</h3>
                {pdf.summary && (
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                    {pdf.summary}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Added {new Date(pdf.added_at * 1000).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}

        {selectedPdf && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold truncate">{selectedPdf.filename}</h2>
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="p-1 hover:bg-muted rounded"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                {contentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                ) : (
                  <>
                    {pdfContent && (
                      <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono mb-6">
                        {pdfContent}
                      </pre>
                    )}
                    {pdfImages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-3">Extracted Images</h3>
                        <div className="space-y-4">
                          {pdfImages.map((key, index) => (
                            <img
                              key={key}
                              src={`${API_BASE}/api/pdfs/images/${key}`}
                              alt={`Page ${index + 1}`}
                              className="max-w-full rounded-lg border border-border"
                              loading="lazy"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
