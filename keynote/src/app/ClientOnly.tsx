"use client";
import dynamic from "next/dynamic";

// The keynote is a full-screen, keyboard-driven app: render it on the client only,
// so it can read the URL hash, window size and saved checklist state on first render.
export const DeckClient = dynamic(() => import("@/components/Deck").then((m) => m.Deck), { ssr: false });
export const PresenterClient = dynamic(() => import("@/components/Presenter").then((m) => m.Presenter), { ssr: false });
