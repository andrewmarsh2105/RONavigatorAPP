/**
 * src/components/states/ErrorBoundary.tsx
 *
 * App-wide safety net for unexpected runtime errors.
 */
import React from "react";
import { AlertTriangle, Copy, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/EmptyState";

type Props = { children: React.ReactNode };
type State = { error?: Error; info?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info: info.componentStack ?? undefined });
    console.error("App crashed:", error, info);
  }

  private handleReload = () => window.location.reload();

  private handleCopy = async () => {
    const { error, info } = this.state;
    const payload = [
      `Error: ${error?.message ?? "Unknown"}`,
      "",
      error?.stack ?? "",
      "",
      "Component stack:",
      info ?? "",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // ignore
    }
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full">
          <EmptyState
            icon={AlertTriangle}
            title="Something went wrong"
            description={this.state.error.message || "An unexpected error occurred. Please reload the page."}
            actions={
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={this.handleReload}>
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  Reload
                </Button>
                <Button variant="outline" size="sm" onClick={this.handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy error
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }
}
