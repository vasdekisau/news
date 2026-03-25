"use client";

import { useState } from "react";

interface AdjustModalProps {
  articleId: string;
  deviceId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { comment: string; sentiment: string }) => void;
}

type Sentiment = "more" | "less" | "note";

export function AdjustModal({ articleId, deviceId, isOpen, onClose, onSubmit }: AdjustModalProps) {
  const [comment, setComment] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentiment) return;

    setLoading(true);
    try {
      const response = await fetch("https://api.vasdekis.com.au/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_id: deviceId,
          article_id: articleId,
          comment,
          sentiment,
        }),
      });

      if (response.ok) {
        onSubmit({ comment, sentiment });
        setComment("");
        setSentiment(null);
        onClose();
      }
    } catch (err) {
      console.error("Failed to submit preference:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Adjust Recommendation</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Your feedback
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full px-3 py-2 bg-background border border-input rounded-md resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-muted-foreground">
              Sentiment
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSentiment("more")}
                className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                  sentiment === "more"
                    ? "bg-green-500/20 border-green-500 text-green-500"
                    : "border-border hover:bg-muted"
                }`}
              >
                More like this
              </button>
              <button
                type="button"
                onClick={() => setSentiment("less")}
                className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                  sentiment === "less"
                    ? "bg-red-500/20 border-red-500 text-red-500"
                    : "border-border hover:bg-muted"
                }`}
              >
                Less like this
              </button>
              <button
                type="button"
                onClick={() => setSentiment("note")}
                className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                  sentiment === "note"
                    ? "bg-blue-500/20 border-blue-500 text-blue-500"
                    : "border-border hover:bg-muted"
                }`}
              >
                Just a note
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!sentiment || loading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
