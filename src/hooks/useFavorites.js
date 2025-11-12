import { useState, useEffect, useCallback } from "react";
import {
  loadFavorites,
  saveFavorites,
  addToFavorites,
  removeFromFavorites,
  isRecipeFavorited,
} from "../utils/draftStorage";
import userService from "../services/userService";

/**
 * Get user identifier from localStorage or generate new one
 */
const getUserIdentifier = () => {
  return userService.getUserIdentifier();
};

/**
 * Custom hook for fetching favorites
 * @returns {Object} - { favorites, loading, error, refetch }
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load from localStorage
      const favoritesData = loadFavorites();
      setFavorites(favoritesData || []);
    } catch (err) {
      setError(err.message || "An error occurred while fetching favorites");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const addFavorite = async (recipe) => {
    try {
      const success = addToFavorites(recipe);
      if (success) {
        await fetchFavorites(); // Refresh the list
      }
      return success;
    } catch (error) {
      console.error("Error adding favorite:", error);
      return false;
    }
  };

  const removeFavorite = async (recipeId) => {
    try {
      const success = removeFromFavorites(recipeId);
      if (success) {
        await fetchFavorites(); // Refresh the list
      }
      return success;
    } catch (error) {
      console.error("Error removing favorite:", error);
      return false;
    }
  };

  return {
    favorites,
    loading,
    error,
    refetch: fetchFavorites,
    addFavorite,
    removeFavorite,
  };
}

/**
 * Custom hook for toggling favorites
 * @returns {Object} - { toggleFavorite, loading, error }
 */
export function useToggleFavorite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFavorite = async (recipe) => {
    try {
      setLoading(true);
      setError(null);

      const isFavorited = isRecipeFavorited(recipe.id);

      if (isFavorited) {
        removeFromFavorites(recipe.id);
        return false; // Removed
      } else {
        addToFavorites(recipe);
        return true; // Added
      }
    } catch (err) {
      setError(err.message || "An error occurred while toggling favorite");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    toggleFavorite,
    loading,
    error,
  };
}

/**
 * Custom hook to check if a recipe is favorited
 * @param {string} recipeId - Recipe ID
 * @returns {Object} - { isFavorited, loading, toggleFavorite }
 */
export function useIsFavorited(recipeId) {
  const { favorites, loading: fetchLoading, refetch } = useFavorites();
  const { toggleFavorite: toggle, loading: toggleLoading } =
    useToggleFavorite();

  const isFavorited = favorites.some((fav) => fav.id === recipeId);

  const toggleFavorite = async (recipe) => {
    const result = await toggle(recipe);
    if (result !== null) {
      await refetch();
    }
    return result;
  };

  return {
    isFavorited,
    loading: fetchLoading || toggleLoading,
    toggleFavorite,
  };
}

export { getUserIdentifier };
