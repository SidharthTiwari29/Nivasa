"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

// Without this, any real error thrown while rendering the immersive
// experience (a WebGL context failure, a missing browser API, anything)
// takes down the entire page with React's default behavior: a blank
// screen and nothing else, visible only in a console the person
// experiencing it usually has no reason to open. This makes the actual
// failure visible on the page itself, so a real problem is diagnosable
// instead of indistinguishable from "nothing loaded at all."
export class ExperienceErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Real, visible server-side-reachable log - shows up in Vercel's
    // function/runtime logs, not just the browser console, so this is
    // diagnosable even without asking someone to open dev tools.
    console.error("Immersive experience failed to render:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center text-ink">
          <p className="font-display text-2xl font-semibold">Niwasthan</p>
          <p className="max-w-md font-body text-sm text-ink-soft">
            Something didn&apos;t load correctly. This has been logged - please
            try refreshing the page.
          </p>
          <p className="max-w-md font-mono text-xs text-ink-soft/70">
            {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
