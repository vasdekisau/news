"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.vasdekis.com.au";

interface Source {
  id: string;
  name: string;
  type: string;
  url: string;
  enabled: number;
}

export default function Sources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSource, setNewSource] = useState({ name: "", type: "rss", url: "" });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sources`);
      const data = await res.json();
      setSources(data.sources || []);
    } catch (err) {
      console.error("Failed to fetch sources:", err);
    } finally {
      setLoading(false);
    }
  };

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSource),
      });
      setNewSource({ name: "", type: "rss", url: "" });
      fetchSources();
    } catch (err) {
      console.error("Failed to add source:", err);
    }
  };

  const deleteSource = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/sources/${id}`, { method: "DELETE" });
      fetchSources();
    } catch (err) {
      console.error("Failed to delete source:", err);
    }
  };

  const fetchNow = async (id: string) => {
    try {
      await fetch(`${API_BASE}/api/sources/${id}/fetch`, { method: "POST" });
      alert("Fetch job queued!");
    } catch (err) {
      console.error("Failed to trigger fetch:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Content Sources</h1>
        
        <form onSubmit={addSource} className="bg-card rounded-lg border border-border p-4 mb-6">
          <h2 className="font-semibold mb-4">Add Source</h2>
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Name"
              value={newSource.name}
              onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              className="bg-input border border-border rounded px-3 py-2"
              required
            />
            <select
              value={newSource.type}
              onChange={(e) => setNewSource({ ...newSource, type: e.target.value })}
              className="bg-input border border-border rounded px-3 py-2"
            >
              <option value="rss">RSS</option>
              <option value="api">API</option>
              <option value="scrape">Web Scraping</option>
            </select>
            <input
              type="url"
              placeholder="URL"
              value={newSource.url}
              onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
              className="bg-input border border-border rounded px-3 py-2"
              required
            />
            <button type="submit" className="bg-primary text-primary-foreground rounded px-4 py-2 hover:opacity-90">
              Add Source
            </button>
          </div>
        </form>
        
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : sources.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No sources yet
          </div>
        ) : (
          <div className="space-y-4">
            {sources.map((source) => (
              <div key={source.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{source.name}</h3>
                    <p className="text-sm text-muted-foreground">{source.type} • {source.url}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${source.enabled ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
                    {source.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => fetchNow(source.id)}
                    className="text-sm text-primary hover:underline"
                  >
                    Fetch Now
                  </button>
                  <button 
                    onClick={() => deleteSource(source.id)}
                    className="text-sm text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
