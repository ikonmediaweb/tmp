import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import AuthWrapper from "./components/AuthWrapper";
import ClientForm from "./components/ClientForm";
import { supabase } from "./utils/supabase";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingParentAuth, setIsCheckingParentAuth] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const [showWebsiteProviderSection, setShowWebsiteProviderSection] = useState(false);

  

  const handleNavigation = (sectionId: string) => {
    setCurrentSection(sectionId);
    
    // Load the appropriate section based on ID
    if (sectionId === "website") {
      // Load the websiteProviderSection
      setShowWebsiteProviderSection(true);
    } else {
      // Handle other sections
      setShowWebsiteProviderSection(false);
    }
  };

  useEffect(() => {
    const handleAuthError = async (error) => {
      if (
        error?.message?.includes("Invalid Refresh Token") ||
        error?.message?.includes("refresh_token_not_found")
      ) {
        await supabase.auth.signOut();
        setSession(null);
        setError("Your session has expired. Please sign in again.");
      }
    };

    const handleAuthMessage = async (event) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
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
          setSession(session);
          setIsCheckingParentAuth(false);
        } catch (error) {
          console.error("Error setting auth session:", error);
          handleAuthError(error);
        }
      }
    };

    window.addEventListener("message", handleAuthMessage);

    const isIframe = window !== window.parent;

    if (isIframe) {
      window.parent.postMessage({ type: "get_supabase_auth" }, "*");

      setTimeout(() => {
        setIsCheckingParentAuth(false);
      }, 3000);
    } else {
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) handleAuthError(error);
        setSession(session);
        setIsLoading(false);
        setIsCheckingParentAuth(false);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("message", handleAuthMessage);
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSigningIn(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
      setIsSigningIn(false);
      return;
    }
    
    // Check if client record exists
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("auth_user_id", data.user?.id)
      .single();
    
    if (clientError && !clientData) {
      // Create new client record
      const { error: createError } = await supabase
        .from("clients")
        .insert({
          auth_user_id: data.user?.id,
          email: email,
          name: email.split("@")[0], // Default name from email
          active: true,
        });
      
      if (createError) {
        setError("Error creating client profile");
        console.error("Error creating client:", createError);
      }
    }
    
    setIsSigningIn(false);
  };

  const handleSignUp = async () => {
    setError("");
    setIsSigningIn(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setError("Check your email for the confirmation link.");
    }
    setIsSigningIn(false);
  };

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

  if (!session && !isCheckingParentAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <Calendar className="w-12 h-12 text-blue-900 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Client Data Manager
          </h2>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
              >
                {isSigningIn ? "Signing In..." : "Sign In"}
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={isSigningIn}
                className="w-full px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return <ClientForm />;
}

export default App;