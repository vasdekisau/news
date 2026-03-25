"use client";

import { useState } from "react";
import { AdjustModal } from "./adjust-modal";

interface Article {
  id: string;
  title: string;
  url: string;
  source: string;
  content?: string;
  summary: string;
  published_at: number;
  image_url: string;
  category: string;
  user_preference?: number;
}

interface ArticleCardProps {
  article: Article;
  deviceId: string;
  onAdjust?: () => void;
}

export function ArticleCard({ article, deviceId, onAdjust }: ArticleCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const timeAgo = article.published_at 
    ? new Date(article.published_at * 1000).toLocaleDateString()
    : "";

  const hasFullContent = article.content && article.content.length > (article.summary?.length || 0) + 50;

  return (
    <>
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
            
            <h2 className="text-lg font-semibold mb-2">
              {article.title}
            </h2>
            
            {hasFullContent && expanded ? (
              <div className="mt-2">
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Show less
                </button>
              </div>
            ) : hasFullContent ? (
              <>
                {article.summary && (
                  <p className="text-muted-foreground mt-2 line-clamp-3">
                    {article.summary}
                  </p>
                )}
                <button
                  onClick={() => setExpanded(true)}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Read full article
                </button>
              </>
            ) : (
              <>
                {article.summary && (
                  <p className="text-muted-foreground mt-2 line-clamp-3">
                    {article.summary}
                  </p>
                )}
              </>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <a 
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors text-center"
            >
              {hasFullContent ? "Source" : "Read original"}
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Adjust
            </button>
          </div>
        </div>
      </div>

      <AdjustModal
        articleId={article.id}
        deviceId={deviceId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={() => onAdjust?.()}
      />
    </>
  );
}
