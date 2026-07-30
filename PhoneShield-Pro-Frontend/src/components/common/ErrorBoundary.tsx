import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("PhoneShield Pro error boundary:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="card-elevated max-w-md p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <ExclamationTriangleIcon className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-lg font-semibold">Something broke</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred while rendering this screen.
          </p>
          <p className="mt-3 rounded-xl bg-muted p-3 text-left font-mono text-xs break-words text-muted-foreground">
            {this.state.error.message}
          </p>
          <Button
            className="mt-5 rounded-xl"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Reload app
          </Button>
        </div>
      </div>
    );
  }
}
