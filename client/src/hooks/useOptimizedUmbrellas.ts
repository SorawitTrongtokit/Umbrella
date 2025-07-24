import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { firebaseClient } from '@/lib/firebase-client';

interface OptimizedUmbrella {
  id: number;
  umbrellaNumber: number;
  status: 'available' | 'borrowed';
  borrower?: string;
  borrowerPhone?: string;
  borrowLocation?: string;
  borrowedAt?: Date;
  returnLocation?: string;
  returnedAt?: Date;
}

interface OptimizedActivity {
  id: number;
  type: 'borrow' | 'return';
  umbrellaNumber: number;
  borrower: string;
  location: string;
  timestamp: Date;
}

export function useOptimizedUmbrellas() {
  const queryClient = useQueryClient();

  // Optimized umbrella query with Firebase
  const {
    data: umbrellas = [],
    isLoading: isLoadingUmbrellas,
    error: umbrellaError
  } = useQuery({
    queryKey: ['umbrellas'],
    queryFn: () => firebaseClient.getAllUmbrellas(),
    staleTime: 15 * 1000, // 15 seconds - umbrellas change frequently
    select: (data) => data.sort((a, b) => a.umbrellaNumber - b.umbrellaNumber), // Pre-sort data
  });

  // Optimized activities query with Firebase
  const {
    data: activities = [],
    isLoading: isLoadingActivities,
    error: activityError
  } = useQuery({
    queryKey: ['activities'],
    queryFn: () => firebaseClient.getAllActivities(),
    staleTime: 60 * 1000, // 1 minute - activities are less critical for real-time
    select: (data) => data.slice(0, 20), // Only keep latest 20 activities in memory
  });

  // Memoized statistics to prevent recalculation
  const stats = useMemo(() => {
    const available = umbrellas.filter(u => u.status === 'available').length;
    const borrowed = umbrellas.filter(u => u.status === 'borrowed').length;
    const total = umbrellas.length;
    const utilizationRate = total > 0 ? ((borrowed / total) * 100).toFixed(1) : '0.0';

    return {
      available,
      borrowed,
      total,
      utilizationRate: parseFloat(utilizationRate)
    };
  }, [umbrellas]);

  // Memoized filtered lists
  const availableUmbrellas = useMemo(() => 
    umbrellas.filter(u => u.status === 'available'), [umbrellas]
  );

  const borrowedUmbrellas = useMemo(() => 
    umbrellas.filter(u => u.status === 'borrowed'), [umbrellas]
  );

  // Optimized borrow mutation with Firebase
  const borrowMutation = useMutation({
    mutationFn: async ({ 
      umbrellaNumber, 
      borrower, 
      borrowerPhone, 
      borrowLocation 
    }: {
      umbrellaNumber: number;
      borrower: string;
      borrowerPhone: string;
      borrowLocation: string;
    }) => {
      return firebaseClient.borrowUmbrella(umbrellaNumber, borrower, borrowerPhone, borrowLocation);
    },
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['umbrellas'] });
      
      const previousUmbrellas = queryClient.getQueryData(['umbrellas']);
      
      queryClient.setQueryData(['umbrellas'], (old: OptimizedUmbrella[] = []) =>
        old.map(umbrella => 
          umbrella.umbrellaNumber === variables.umbrellaNumber
            ? { 
                ...umbrella, 
                status: 'borrowed' as const,
                borrower: variables.borrower,
                borrowerPhone: variables.borrowerPhone,
                borrowLocation: variables.borrowLocation,
                borrowedAt: new Date()
              }
            : umbrella
        )
      );

      return { previousUmbrellas };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUmbrellas) {
        queryClient.setQueryData(['umbrellas'], context.previousUmbrellas);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['umbrellas'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  // Optimized return mutation with Firebase
  const returnMutation = useMutation({
    mutationFn: async ({ 
      umbrellaNumber, 
      returnLocation 
    }: {
      umbrellaNumber: number;
      returnLocation: string;
    }) => {
      return firebaseClient.returnUmbrella(umbrellaNumber, returnLocation);
    },
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['umbrellas'] });
      
      const previousUmbrellas = queryClient.getQueryData(['umbrellas']);
      
      queryClient.setQueryData(['umbrellas'], (old: OptimizedUmbrella[] = []) =>
        old.map(umbrella => 
          umbrella.umbrellaNumber === variables.umbrellaNumber
            ? { 
                ...umbrella, 
                status: 'available' as const,
                borrower: undefined,
                borrowerPhone: undefined,
                borrowLocation: undefined,
                borrowedAt: undefined,
                returnLocation: variables.returnLocation,
                returnedAt: new Date()
              }
            : umbrella
        )
      );

      return { previousUmbrellas };
    },
    onError: (err, variables, context) => {
      if (context?.previousUmbrellas) {
        queryClient.setQueryData(['umbrellas'], context.previousUmbrellas);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['umbrellas'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });

  // Optimized helper functions
  const borrowUmbrella = useCallback((
    umbrellaNumber: number, 
    borrower: string, 
    borrowerPhone: string, 
    borrowLocation: string
  ) => {
    return borrowMutation.mutateAsync({ 
      umbrellaNumber, 
      borrower, 
      borrowerPhone, 
      borrowLocation 
    });
  }, [borrowMutation]);

  const returnUmbrella = useCallback((
    umbrellaNumber: number, 
    returnLocation: string
  ) => {
    return returnMutation.mutateAsync({ umbrellaNumber, returnLocation });
  }, [returnMutation]);

  // Get umbrella by number (memoized)
  const getUmbrellaByNumber = useCallback((number: number) => {
    return umbrellas.find(u => u.umbrellaNumber === number);
  }, [umbrellas]);

  return {
    // Data
    umbrellas,
    activities,
    stats,
    availableUmbrellas,
    borrowedUmbrellas,
    
    // Loading states
    loading: isLoadingUmbrellas || isLoadingActivities,
    isLoadingUmbrellas,
    isLoadingActivities,
    
    // Error states
    error: umbrellaError || activityError,
    umbrellaError,
    activityError,
    
    // Mutation states
    isBorrowing: borrowMutation.isPending,
    isReturning: returnMutation.isPending,
    
    // Actions
    borrowUmbrella,
    returnUmbrella,
    getUmbrellaByNumber,
    
    // Utilities
    clearError: () => {
      queryClient.removeQueries({ queryKey: ['umbrellas'], type: 'all' });
      queryClient.removeQueries({ queryKey: ['activities'], type: 'all' });
    }
  };
}