"use client";

import { useState, useEffect } from "react";

const PASSWORD = "14";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("news_password");
    if (stored === PASSWORD) {
      setAuthenticated(true);
    }
    setChecking(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem("news_password", PASSWORD);
      setAuthenticated(true);
    } else {
      setInput("");
    }
  }

  if (checking) return null;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <form onSubmit={handleSubmit} className="text-center">
          <h1 className="text-2xl font-bold mb-6">News Vasdekis</h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-48 px-4 py-2 rounded-lg border border-border bg-background text-foreground text-center mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="block w-48 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
