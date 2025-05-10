import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "../utils/supabase";

interface AuthWrapperProps {
  children: React.ReactNode;
  session: Session | null;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, session }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingParentAuth, setIsCheckingParentAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = async (error: any) => {
    if (
      error?.message?.includes("Invalid Refresh Token") ||
      error?.message?.includes("refresh_token_not_found")
    ) {
      await supabase.auth.signOut();
      setError("Your session has expired. Please sign in again.");
    }
  };

  useEffect(() => {
    const handleAuthMessage = async (event: MessageEvent) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://regal-haupia-449e3b.netlify.app",
        "https://resilient-eclair-c41abd.netlify.app",
        "https://fastidious-faloodeh-52c6bc.netlify.app",
        window.location.origin,
      ];

      if (!allowedOrigins.includes(event.origin)) return;

      if (event.data?.type === "supabase_auth_data") {
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.setSession(event.data.authData);
          if (error) throw error;
          setIsCheckingParentAuth(false);
        } catch (error) {
          console.error("Error setting auth session:", error);
          handleAuthError(error);
        }
      }
    };

    window.addEventListener("message", handleAuthMessage);

    // Check if we're in an iframe
    const isIframe = window !== window.parent;

    if (isIframe) {
      // Request auth from parent
      window.parent.postMessage({ type: "get_supabase_auth" }, "*");

      // Set timeout to show error if no response
      setTimeout(() => {
        setIsCheckingParentAuth(false);
      }, 3000);
    } else {
      // Not in iframe, get session directly
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) handleAuthError(error);
        setIsLoading(false);
        setIsCheckingParentAuth(false);
      });
    }

    return () => {
      window.removeEventListener("message", handleAuthMessage);
    };
  }, [handleAuthError]);

  if (isLoading || isCheckingParentAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <AlertTriangle size={64} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return session ? <>{children}</> : null;
};

export default AuthWrapper;