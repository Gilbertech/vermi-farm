import { useState, useEffect } from 'react';
import { ApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> & {
  execute: () => Promise<void>;
  reset: () => void;
} {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError('Unknown error', 'UNKNOWN_ERROR');
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      options.onError?.(error);
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<{ items: T[]; pagination: any }>,
  initialPage = 1,
  initialLimit = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const loadData = async (newPage?: number, newLimit?: number) => {
    const currentPage = newPage ?? page;
    const currentLimit = newLimit ?? limit;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall(currentPage, currentLimit);
      setData(result.items);
      setPagination(result.pagination);
      
      if (newPage !== undefined) setPage(newPage);
      if (newLimit !== undefined) setLimit(newLimit);
    } catch (err) {
      const error = err instanceof ApiError ? err : new ApiError('Unknown error', 'UNKNOWN_ERROR');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const nextPage = () => {
    if (pagination && page < pagination.total_pages) {
      loadData(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      loadData(page - 1);
    }
  };

  const goToPage = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.total_pages) {
      loadData(newPage);
    }
  };

  const changeLimit = (newLimit: number) => {
    loadData(1, newLimit); // Reset to first page when changing limit
  };

  return {
    data,
    pagination,
    loading,
    error,
    page,
    limit,
    loadData,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    refresh: () => loadData(page, limit)
  };
}