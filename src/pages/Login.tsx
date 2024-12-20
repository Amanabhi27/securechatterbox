import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', session); // Enhanced debugging
      if (event === 'SIGNED_IN') {
        navigate('/');
      } else if (event === 'USER_UPDATED' && !session) {
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again. Make sure you've verified your email if required.",
          variant: "destructive",
        });
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  // If user is already logged in, redirect to main page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to SecureChat</h1>
        <Alert className="mb-6">
          <AlertDescription>
            Please sign in with your email and password. Make sure you have verified your email address if required.
          </AlertDescription>
        </Alert>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(var(--primary))',
                  brandAccent: 'rgb(var(--primary))',
                }
              }
            }
          }}
          view="sign_in"
          showLinks={false}
          providers={[]}
        />
      </div>
    </div>
  );
};

export default Login;