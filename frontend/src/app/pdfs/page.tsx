"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.vasdekis.com.au";

interface PDF {
  id: string;
  filename: string;
  summary: string;
  added_at: number;
}

export default function PDFs() {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchPdfs();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">PDFs</h1>
        
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : pdfs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">No PDFs yet</p>
            <p className="text-sm text-muted-foreground">
              Connect Google Drive to sync PDFs
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="bg-card rounded-lg border border-border p-4">
                <h3 className="font-semibold">{pdf.filename}</h3>
                {pdf.summary && (
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                    {pdf.summary}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Added {new Date(pdf.added_at * 1000).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
