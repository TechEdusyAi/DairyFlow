import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user from Supabase
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    retry: false,
  });

  // Login with email/password
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  // Signup with email/password
  const signupMutation = useMutation({
    mutationFn: async ({ email, password, firstName, lastName, role = 'user' }: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      role?: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role
          }
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  // Phone login (send OTP)
  const phoneLoginMutation = useMutation({
    mutationFn: async (phone: string) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) throw error;
      return data;
    },
  });

  // Verify OTP
  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, token }: { phone: string; token: string }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  // Google login
  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    phoneLogin: phoneLoginMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,
    googleLogin: googleLoginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    isPhoneLoginLoading: phoneLoginMutation.isPending,
    isVerifyOtpLoading: verifyOtpMutation.isPending,
    isGoogleLoginLoading: googleLoginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
  };
}
