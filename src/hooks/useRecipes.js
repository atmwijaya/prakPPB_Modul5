import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import recipeService from "../services/recipeService";

/**
 * Custom hook for fetching recipes dengan React Query
 * @param {Object} params - Query parameters
 * @returns {Object} - { recipes, loading, error, pagination, refetch }
 */
export function useRecipes(params = {}) {
  const {
    data: response,
    isLoading: loading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['recipes', params],
    queryFn: async () => {
      const response = await recipeService.getRecipes(params);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch recipes");
      }

      // Ensure all recipes have complete data structure
      const completeRecipes = (response.data || []).map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        image_url: recipe.image_url || recipe.image || '/placeholder-recipe.jpg'
      }));

      return {
        ...response,
        data: completeRecipes,
        pagination: response.pagination || null
      };
    },
    staleTime: 5 * 60 * 1000, // 5 menit
    cacheTime: 10 * 60 * 1000, // 10 menit
    keepPreviousData: true,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    recipes: response?.data || [],
    loading,
    error: error?.message,
    isFetching,
    pagination: response?.pagination || null,
    refetch,
  };
}

/**
 * Custom hook for fetching a single recipe dengan React Query
 * @param {string} id - Recipe ID
 * @returns {Object} - { recipe, loading, error, refetch }
 */
export function useRecipe(id) {
  const {
    data: response,
    isLoading: loading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      if (!id) {
        return { success: true, data: null };
      }

      const response = await recipeService.getRecipeById(id);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch recipe");
      }

      // Ensure recipe has complete data structure
      const completeRecipe = {
        ...response.data,
        ingredients: response.data.ingredients || [],
        steps: response.data.steps || [],
        image_url: response.data.image_url || response.data.image || '/placeholder-recipe.jpg'
      };

      return {
        ...response,
        data: completeRecipe
      };
    },
    enabled: !!id, // Hanya fetch jika ID tersedia
    staleTime: 5 * 60 * 1000, // 5 menit
    cacheTime: 10 * 60 * 1000, // 10 menit
    retry: 2,
  });

  return {
    recipe: response?.data || null,
    loading,
    error: error?.message,
    isFetching,
    refetch,
  };
}

/**
 * Custom hook for creating recipes dengan React Query Mutation
 * @returns {Object} - { createRecipe, loading, error }
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createRecipe,
    isLoading: loading,
    error,
    isSuccess,
    reset,
  } = useMutation({
    mutationFn: async (recipeData) => {
      // Ensure data structure is complete
      const completeRecipeData = {
        ...recipeData,
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps || [],
        image_url: recipeData.image_url || recipeData.image || ''
      };

      const response = await recipeService.createRecipe(completeRecipeData);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to create recipe");
      }

      return response.data;
    },
    onSuccess: (newRecipe) => {
      // Invalidate dan refetch queries yang terkait
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      
      // Prefetch data untuk recipe detail jika diperlukan
      if (newRecipe?.id) {
        queryClient.setQueryData(
          ['recipe', newRecipe.id],
          { success: true, data: newRecipe }
        );
      }
    },
    onError: (error) => {
      console.error('Error creating recipe:', error);
    },
  });

  return { 
    createRecipe, 
    loading, 
    error: error?.message,
    isSuccess,
    reset 
  };
}

/**
 * Custom hook for updating recipes dengan React Query Mutation
 * @returns {Object} - { updateRecipe, loading, error }
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateRecipe,
    isLoading: loading,
    error,
    isSuccess,
    reset,
  } = useMutation({
    mutationFn: async ({ recipeId, updatedData }) => {
      // Get current recipe first untuk optimistic update
      const currentResponse = await recipeService.getRecipeById(recipeId);
      if (!currentResponse.success) {
        throw new Error("Failed to fetch current recipe data");
      }

      const currentRecipe = currentResponse.data;

      // Ensure existing data is preserved if not provided in update
      const completeUpdateData = {
        ...currentRecipe,
        ...updatedData,
        // Preserve image if not updated
        image_url: updatedData.image_url || updatedData.image || currentRecipe.image_url || currentRecipe.image,
        // Ensure arrays are not lost
        ingredients: updatedData.ingredients || currentRecipe.ingredients || [],
        steps: updatedData.steps || currentRecipe.steps || [],
        updated_at: new Date().toISOString()
      };

      const response = await recipeService.updateRecipe(recipeId, completeUpdateData);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to update recipe");
      }

      return response.data;
    },
    onSuccess: (updatedRecipe, variables) => {
      // Update cache untuk recipe yang di-update
      if (updatedRecipe?.id) {
        queryClient.setQueryData(
          ['recipe', updatedRecipe.id],
          { success: true, data: updatedRecipe }
        );
      }

      // Invalidate semua queries recipes untuk refresh list
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error, variables, context) => {
      console.error('Error updating recipe:', error);
    },
  });

  // Wrapper function untuk match signature lama
  const updateRecipeWrapper = async (recipeId, updatedData) => {
    return await updateRecipe({ recipeId, updatedData });
  };

  return { 
    updateRecipe: updateRecipeWrapper, 
    loading, 
    error: error?.message,
    isSuccess,
    reset 
  };
}

/**
 * Custom hook for deleting recipes dengan React Query Mutation
 * @returns {Object} - { deleteRecipe, loading, error }
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: deleteRecipe,
    isLoading: loading,
    error,
    isSuccess,
    reset,
  } = useMutation({
    mutationFn: async (recipeId) => {
      const response = await recipeService.deleteRecipe(recipeId);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to delete recipe");
      }

      return true;
    },
    onSuccess: (_, recipeId) => {
      // Remove dari cache
      queryClient.removeQueries({ queryKey: ['recipe', recipeId] });
      
      // Invalidate recipes list
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error) => {
      console.error('Error deleting recipe:', error);
    },
  });

  return { 
    deleteRecipe, 
    loading, 
    error: error?.message,
    isSuccess,
    reset 
  };
}

/**
 * Custom hook untuk favorite/unfavorite recipes
 * @returns {Object} - { toggleFavorite, loading, error }
 */
export function useFavoriteRecipe() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: toggleFavorite,
    isLoading: loading,
    error,
  } = useMutation({
    mutationFn: async ({ recipeId, isFavorite }) => {
      const response = isFavorite 
        ? await recipeService.unfavoriteRecipe(recipeId)
        : await recipeService.favoriteRecipe(recipeId);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to update favorite status");
      }

      return response.data;
    },
    onSuccess: (updatedRecipe, variables) => {
      // Update cache untuk recipe yang di-update
      if (updatedRecipe?.id) {
        queryClient.setQueryData(
          ['recipe', updatedRecipe.id],
          { success: true, data: updatedRecipe }
        );
      }

      // Invalidate recipes list untuk update favorite status
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    // Optimistic update untuk immediate UI response
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['recipe', variables.recipeId] });
      await queryClient.cancelQueries({ queryKey: ['recipes'] });

      // Snapshot previous value
      const previousRecipe = queryClient.getQueryData(['recipe', variables.recipeId]);
      const previousRecipes = queryClient.getQueryData(['recipes']);

      // Optimistically update cache
      if (previousRecipe) {
        queryClient.setQueryData(
          ['recipe', variables.recipeId],
          old => ({
            ...old,
            data: {
              ...old.data,
              is_favorite: variables.isFavorite
            }
          })
        );
      }

      // Return context dengan snapshot
      return { previousRecipe, previousRecipes };
    },
    onError: (error, variables, context) => {
      // Rollback ke previous state jika error
      if (context?.previousRecipe) {
        queryClient.setQueryData(
          ['recipe', variables.recipeId],
          context.previousRecipe
        );
      }
      if (context?.previousRecipes) {
        queryClient.setQueryData(
          ['recipes'],
          context.previousRecipes
        );
      }
    },
  });

  return { 
    toggleFavorite, 
    loading, 
    error: error?.message 
  };
}

/**
 * Custom hook untuk search recipes dengan debounce
 * @param {Object} params - Search parameters
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Object} - { recipes, loading, error, pagination }
 */
export function useSearchRecipes(params = {}, debounceMs = 300) {
  const {
    data: response,
    isLoading: loading,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['recipes', 'search', params],
    queryFn: async () => {
      const response = await recipeService.getRecipes(params);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to search recipes");
      }

      // Ensure all recipes have complete data structure
      const completeRecipes = (response.data || []).map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        image_url: recipe.image_url || recipe.image || '/placeholder-recipe.jpg'
      }));

      return {
        ...response,
        data: completeRecipes,
        pagination: response.pagination || null
      };
    },
    staleTime: 2 * 60 * 1000, // 2 menit untuk search results
    cacheTime: 5 * 60 * 1000, // 5 menit
    keepPreviousData: true,
    retry: 1,
  });

  return {
    recipes: response?.data || [],
    loading,
    error: error?.message,
    isFetching,
    pagination: response?.pagination || null,
  };
}