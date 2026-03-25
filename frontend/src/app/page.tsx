"use client";

import { useEffect, useState } from "react";
import { ArticleCard } from "@/components/article-card";
import { Header } from "@/components/header";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.vasdekis.com.au";

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  summary: string;
  published_at: number;
  image_url: string;
  category: string;
  user_preference?: number;
  day_date?: string;
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}

function formatDayHeader(dayDate: string): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const date = new Date(dayDate + 'T00:00:00')
  const dateStr = date.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })
  
  if (dayDate === today.toISOString().split('T')[0]) return `Today - ${dateStr}`
  if (dayDate === yesterday.toISOString().split('T')[0]) return `Yesterday - ${dateStr}`
  return dateStr
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceId] = useState(() => getDeviceId());
  const [collapsedDays, setCollapsedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch(`${API_BASE}/api/feed?device_id=${deviceId}&limit=30`);
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, [deviceId]);

  const handleAdjust = (articleId: string) => {
    async function refreshFeed() {
      try {
        const res = await fetch(`${API_BASE}/api/feed?device_id=${deviceId}&limit=30`);
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Failed to refresh feed:", err);
      }
    }
    refreshFeed();
  };

  const toggleDay = (dayDate: string) => {
    setCollapsedDays(prev => {
      const next = new Set(prev)
      if (next.has(dayDate)) {
        next.delete(dayDate)
      } else {
        next.add(dayDate)
      }
      return next
    })
  };

  const grouped = articles.reduce<Record<string, Article[]>>((acc, article) => {
    const day = article.day_date || 'unknown'
    if (!acc[day]) acc[day] = []
    acc[day].push(article)
    return acc
  }, {})

  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
        
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">No articles yet</p>
            <p className="text-sm text-muted-foreground">Add content sources to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDays.map(day => (
              <div key={day}>
                <button
                  onClick={() => toggleDay(day)}
                  className="sticky top-0 z-10 w-full py-2 px-3 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between font-semibold text-sm mb-2"
                >
                  <span>{formatDayHeader(day)}</span>
                  <span className="text-muted-foreground text-xs">{grouped[day].length} articles</span>
                </button>
                {!collapsedDays.has(day) && (
                  <div className="space-y-4">
                    {grouped[day].map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        deviceId={deviceId}
                        onAdjust={() => handleAdjust(article.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
