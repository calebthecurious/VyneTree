import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { User, InsertUser } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for getting the current user
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 300000, // 5 minutes
  });

  // Mutation for login
  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authApi.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data.user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for registration
  const register = useMutation({
    mutationFn: (userData: InsertUser) => authApi.register(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/auth/me'], data.user);
      toast({
        title: "Registration successful",
        description: `Welcome to VyneTree, ${data.user.name}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create your account. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mutation for logout
  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    }
  });

  return {
    user: user as User | null,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refetch
  };
}