import { Button } from "./components/ui/button";
import { HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] gap-6 p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-white">404</h1>
        <h2 className="text-xl font-medium text-white">
          Page not found
        </h2>
      </div>
      <p className="max-w-[600px] text-muted">
        Sorry, we couldn't find the page you're looking for. The page might have
        been removed or the link might be broken.
      </p>
      <Button asChild>
        <Link to="/" className="gap-2">
          <HomeIcon className="size-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
