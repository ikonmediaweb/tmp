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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-900 mx-auto mb-6"></div>
          <p className="text-gray-700 font-medium text-lg">Loading your experience...</p>
        </div>
      </div>
    );
  }

  if (!session && !isCheckingParentAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center max-w-md w-full mx-auto p-10 bg-white rounded-2xl shadow-xl transform transition-all">
          <div className="bg-blue-50 p-4 rounded-full w-20 h-20 mx-auto mb-6">
            <Calendar className="w-12 h-12 text-blue-900 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Client Data Manager
          </h2>
          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-left text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-left text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSigningIn}
                className="w-full px-6 py-3 bg-blue-900 text-white text-lg font-semibold rounded-xl hover:bg-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSigningIn ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                disabled={isSigningIn}
                className="w-full px-6 py-3 bg-gray-100 text-gray-800 text-lg font-semibold rounded-xl hover:bg-gray-200 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
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