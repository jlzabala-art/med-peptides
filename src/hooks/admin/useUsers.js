import { useFirestoreCollection } from '../data/useFirestoreCollection';

export function useUsers(options = {}) {
  const {
    data: users,
    isLoading,
    error,
    refetch,
    addDocAsync,
    updateDocAsync,
    deleteDocAsync,
  } = useFirestoreCollection('users', {
    ...options,
    orderByFields: options.orderByFields || [['name', 'asc']],
  });

  return {
    users,
    loading: isLoading,
    error,
    refetch,
    addUser: addDocAsync,
    updateUser: updateDocAsync,
    deleteUser: deleteDocAsync,
  };
}
