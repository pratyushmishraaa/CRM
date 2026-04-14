import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export const useList = (resource, params = {}, options = {}) => {
  // Strip empty string params so they don't get sent to the API
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return useQuery({
    queryKey: [resource, cleanParams],
    queryFn: () => api.get(`/${resource}`, { params: cleanParams }).then((r) => r.data),
    keepPreviousData: true,
    ...options,
  });
};

export const useOne = (resource, id, options = {}) =>
  useQuery({
    queryKey: [resource, id],
    queryFn: () => api.get(`/${resource}/${id}`).then((r) => r.data),
    enabled: !!id,
    ...options,
  });

export const useMutate = (resource, method = 'post', opts = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data } = {}) => {
      if (method === 'delete') return api.delete(`/${resource}/${id}`);
      if (method === 'patch') return api.patch(`/${resource}/${id}`, data);
      return api.post(`/${resource}`, data);
    },
    onSuccess: () => {
      // Invalidate ALL queries that start with this resource key
      // exact: false ensures [resource, params] queries are also invalidated
      qc.invalidateQueries({ queryKey: [resource], exact: false });
      // Also refetch active queries immediately
      qc.refetchQueries({ queryKey: [resource], exact: false, type: 'active' });
      if (opts.successMessage) toast.success(opts.successMessage);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Something went wrong';
      toast.error(msg);
    },
    ...opts,
  });
};
