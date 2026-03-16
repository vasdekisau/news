"use client";

import { Header } from "@/components/header";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="font-semibold mb-2">About</h2>
            <p className="text-muted-foreground text-sm">
              News Vasdekis aggregates content from across the internet and lets you curate your feed with thumbs up/down.
            </p>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="font-semibold mb-2">Your Device ID</h2>
            <p className="text-muted-foreground text-sm mb-2">
              This app uses a device ID stored in your browser to remember your preferences.
            </p>
            <button 
              onClick={() => {
                localStorage.removeItem("device_id");
                window.location.reload();
              }}
              className="text-sm text-destructive hover:underline"
            >
              Reset device ID
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
