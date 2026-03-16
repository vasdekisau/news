"use client";

import { useState } from "react";

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
}

interface ArticleCardProps {
  article: Article;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
}

export function ArticleCard({ article, onThumbsUp, onThumbsDown }: ArticleCardProps) {
  const [preference, setPreference] = useState(article.user_preference || 0);
  
  const timeAgo = article.published_at 
    ? new Date(article.published_at * 1000).toLocaleDateString()
    : "";

  const handleThumbsUp = () => {
    setPreference(preference === 1 ? 0 : 1);
    onThumbsUp();
  };

  const handleThumbsDown = () => {
    setPreference(preference === -1 ? 0 : -1);
    onThumbsDown();
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      {article.image_url && (
        <img 
          src={article.image_url} 
          alt={article.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}
      
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="font-medium text-primary">{article.source}</span>
            <span>•</span>
            <span>{timeAgo}</span>
            {article.category && (
              <>
                <span>•</span>
                <span className="capitalize">{article.category}</span>
              </>
            )}
          </div>
          
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg font-semibold hover:text-primary/80 transition-colors"
          >
            {article.title}
          </a>
          
          {article.summary && (
            <p className="text-muted-foreground mt-2 line-clamp-3">
              {article.summary}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-1">
          <button
            onClick={handleThumbsUp}
            className={`p-2 rounded-full transition-colors ${
              preference === 1 
                ? "bg-green-500/20 text-green-500" 
                : "hover:bg-muted text-muted-foreground"
            }`}
            aria-label="Thumbs up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10v12"/>
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
            </svg>
          </button>
          
          <button
            onClick={handleThumbsDown}
            className={`p-2 rounded-full transition-colors ${
              preference === -1 
                ? "bg-red-500/20 text-red-500" 
                : "hover:bg-muted text-muted-foreground"
            }`}
            aria-label="Thumbs down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 14V2"/>
              <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
