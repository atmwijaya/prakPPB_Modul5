import { useState, useEffect, useCallback } from "react";
import recipeService from "../services/recipeService";

/**
 * Custom hook for fetching recipes
 * @param {Object} params - Query parameters
 * @returns {Object} - { recipes, loading, error, pagination, refetch }
 */
export function useRecipes(params = {}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recipeService.getRecipes(params);
      if (response.success) {
        // Ensure all recipes have complete data structure
        const completeRecipes = (response.data || []).map(recipe => ({
          ...recipe,
          ingredients: recipe.ingredients || [],
          steps: recipe.steps || [],
          image_url: recipe.image_url || recipe.image || '/placeholder-recipe.jpg'
        }));
        setRecipes(completeRecipes);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || "Failed to fetch recipes");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching recipes");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    pagination,
    refetch: fetchRecipes,
  };
}

/**
 * Custom hook for fetching a single recipe
 * @param {string} id - Recipe ID
 * @returns {Object} - { recipe, loading, error, refetch }
 */
export function useRecipe(id) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await recipeService.getRecipeById(id);
      if (response.success) {
        // Ensure recipe has complete data structure
        const completeRecipe = {
          ...response.data,
          ingredients: response.data.ingredients || [],
          steps: response.data.steps || [],
          image_url: response.data.image_url || response.data.image || '/placeholder-recipe.jpg'
        };
        setRecipe(completeRecipe);
      } else {
        setError(response.message || "Failed to fetch recipe");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching recipe");
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  return {
    recipe,
    loading,
    error,
    refetch: fetchRecipe,
  };
}

/**
 * Custom hook for creating recipes
 * @returns {Object} - { createRecipe, loading, error }
 */
export function useCreateRecipe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRecipe = async (recipeData) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure data structure is complete
      const completeRecipeData = {
        ...recipeData,
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps || [],
        image_url: recipeData.image_url || recipeData.image || ''
      };

      const response = await recipeService.createRecipe(completeRecipeData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || "Failed to create recipe");
        return null;
      }
    } catch (err) {
      setError(err.message || "An error occurred while creating recipe");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createRecipe, loading, error };
}

/**
 * Custom hook for updating recipes
 * @returns {Object} - { updateRecipe, loading, error }
 */
export function useUpdateRecipe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateRecipe = async (recipeId, updatedData) => {
    try {
      setLoading(true);
      setError(null);

      // Get current recipe first to preserve existing data
      const currentResponse = await recipeService.getRecipeById(recipeId);
      if (!currentResponse.success) {
        setError("Failed to fetch current recipe data");
        return null;
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
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || "Failed to update recipe");
        return null;
      }
    } catch (err) {
      setError(err.message || "An error occurred while updating recipe");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateRecipe, loading, error };
}

/**
 * Custom hook for deleting recipes
 * @returns {Object} - { deleteRecipe, loading, error }
 */
export function useDeleteRecipe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteRecipe = async (recipeId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await recipeService.deleteRecipe(recipeId);
      if (response.success) {
        return true;
      } else {
        setError(response.message || "Failed to delete recipe");
        return false;
      }
    } catch (err) {
      setError(err.message || "An error occurred while deleting recipe");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteRecipe, loading, error };
}