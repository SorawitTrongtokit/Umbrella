import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PostgresUmbrella {
  id: number;
  umbrellaNumber: number;
  status: 'available' | 'borrowed';
  borrower?: string | null;
  borrowerPhone?: string | null;
  borrowLocation?: string | null;
  borrowedAt?: string | null;
  returnLocation?: string | null;
  returnedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostgresActivity {
  id: number;
  type: 'borrow' | 'return';
  umbrellaNumber: number;
  borrower: string;
  location: string;
  timestamp: string;
}

// PostgreSQL API functions
export const postgresAPI = {
  // Get all umbrellas
  async getUmbrellas(): Promise<PostgresUmbrella[]> {
    const response = await fetch('/api/umbrellas');
    if (!response.ok) throw new Error('Failed to fetch umbrellas');
    return response.json();
  },

  // Get umbrella by number
  async getUmbrella(umbrellaNumber: number): Promise<PostgresUmbrella> {
    const response = await fetch(`/api/umbrellas/${umbrellaNumber}`);
    if (!response.ok) throw new Error('Failed to fetch umbrella');
    return response.json();
  },

  // Create umbrella
  async createUmbrella(data: { umbrellaNumber: number }): Promise<PostgresUmbrella> {
    const response = await fetch('/api/umbrellas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create umbrella');
    return response.json();
  },

  // Borrow umbrella
  async borrowUmbrella(umbrellaNumber: number, data: {
    borrower: string;
    borrowerPhone: string;
    borrowLocation: string;
  }): Promise<PostgresUmbrella> {
    const response = await fetch(`/api/umbrellas/${umbrellaNumber}/borrow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to borrow umbrella');
    return response.json();
  },

  // Return umbrella
  async returnUmbrella(umbrellaNumber: number, data: {
    returnLocation: string;
  }): Promise<PostgresUmbrella> {
    const response = await fetch(`/api/umbrellas/${umbrellaNumber}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to return umbrella');
    return response.json();
  },

  // Get activities
  async getActivities(): Promise<PostgresActivity[]> {
    const response = await fetch('/api/activities');
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  // Initialize all 21 umbrellas
  async initializeUmbrellas(): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/umbrellas/initialize', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to initialize umbrellas');
    return response.json();
  },

  // Reset all data
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    const response = await fetch('/api/reset', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset database');
    return response.json();
  }
};

// React Query hooks for PostgreSQL
export const usePostgresUmbrellas = () => {
  return useQuery({
    queryKey: ['/api/umbrellas'],
    queryFn: postgresAPI.getUmbrellas,
  });
};

export const usePostgresActivities = () => {
  return useQuery({
    queryKey: ['/api/activities'],
    queryFn: postgresAPI.getActivities,
  });
};

export const usePostgresBorrow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ umbrellaNumber, data }: {
      umbrellaNumber: number;
      data: { borrower: string; borrowerPhone: string; borrowLocation: string };
    }) => postgresAPI.borrowUmbrella(umbrellaNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/umbrellas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
  });
};

export const usePostgresReturn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ umbrellaNumber, data }: {
      umbrellaNumber: number;
      data: { returnLocation: string };
    }) => postgresAPI.returnUmbrella(umbrellaNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/umbrellas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
  });
};

export const usePostgresInitialize = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postgresAPI.initializeUmbrellas,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/umbrellas'] });
    },
  });
};

export const usePostgresReset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postgresAPI.resetDatabase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/umbrellas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
  });
};