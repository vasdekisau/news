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

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceId] = useState(() => getDeviceId());

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(`${API_BASE}/api/articles?limit=50`);
        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const handlePreference = async (articleId: string, preference: number) => {
    await fetch(`${API_BASE}/api/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId, article_id: articleId, preference }),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">All Articles</h1>
        
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No articles yet
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onThumbsUp={() => handlePreference(article.id, 1)}
                onThumbsDown={() => handlePreference(article.id, -1)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
