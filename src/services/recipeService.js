
import { apiClient } from "../config/api";

class RecipeService {
  /**
   * Get all recipes with optional filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.category - Filter by category: 'makanan' | 'minuman'
   * @param {string} params.difficulty - Filter by difficulty: 'mudah' | 'sedang' | 'sulit'
   * @param {string} params.search - Search in name/description
   * @param {string} params.sort_by - Sort by field (default: 'created_at')
   * @param {string} params.order - Sort order: 'asc' | 'desc' (default: 'desc')
   * @returns {Promise}
   */
  async getRecipes(params = {}) {
    try {
      const response = await apiClient.get("/api/v1/recipes", { params });
      
      // Ensure all recipes have complete data structure
      if (response.data && response.data.data) {
        response.data.data = response.data.data.map(recipe => 
          this.normalizeRecipeData(recipe)
        );
      }
      
      return response;
    } catch (error) {
      console.error("Error fetching recipes:", error);
      throw error;
    }
  }

  /**
   * Get recipe by ID
   * @param {string} id - Recipe ID
   * @returns {Promise}
   */
  async getRecipeById(id) {
    try {
      const response = await apiClient.get(`/api/v1/recipes/${id}`);
      
      // Normalize recipe data
      if (response.data && response.data.data) {
        response.data.data = this.normalizeRecipeData(response.data.data);
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching recipe ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new recipe
   * @param {Object} recipeData - Recipe data
   * @returns {Promise}
   */
  async createRecipe(recipeData) {
    try {
      // Prepare data for API
      const preparedData = this.prepareRecipeData(recipeData);
      
      const response = await apiClient.post("/api/v1/recipes", preparedData);
      
      // Normalize response data
      if (response.data && response.data.data) {
        response.data.data = this.normalizeRecipeData(response.data.data);
      }
      
      return response;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  }

  /**
   * Update existing recipe (full replacement)
   * @param {string} id - Recipe ID
   * @param {Object} recipeData - Complete recipe data (all fields required)
   * @returns {Promise}
   */
  async updateRecipe(id, recipeData) {
    try {
      // Get current recipe first to preserve existing data
      let currentRecipe = null;
      try {
        const currentResponse = await this.getRecipeById(id);
        if (currentResponse.data && currentResponse.data.data) {
          currentRecipe = currentResponse.data.data;
        }
      } catch (error) {
        console.warn("Could not fetch current recipe data:", error);
      }

      // Prepare data for API, preserving existing data where needed
      const preparedData = this.prepareRecipeData(recipeData, currentRecipe);
      
      const response = await apiClient.put(`/api/v1/recipes/${id}`, preparedData);
      
      // Normalize response data
      if (response.data && response.data.data) {
        response.data.data = this.normalizeRecipeData(response.data.data);
      }
      
      return response;
    } catch (error) {
      console.error(`Error updating recipe ${id}:`, error);
      throw error;
    }
  }

  /**
   * Partially update recipe (only send fields to update)
   * @param {string} id - Recipe ID
   * @param {Object} partialData - Partial recipe data (only fields to update)
   * @returns {Promise}
   */
  async patchRecipe(id, partialData) {
    try {
      const response = await apiClient.patch(`/api/v1/recipes/${id}`, partialData);
      
      // Normalize response data
      if (response.data && response.data.data) {
        response.data.data = this.normalizeRecipeData(response.data.data);
      }
      
      return response;
    } catch (error) {
      console.error(`Error patching recipe ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete recipe
   * @param {string} id - Recipe ID
   * @returns {Promise}
   */
  async deleteRecipe(id) {
    try {
      const response = await apiClient.delete(`/api/v1/recipes/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting recipe ${id}:`, error);
      throw error;
    }
  }

  /**
   * Normalize recipe data to ensure consistent structure
   * @param {Object} recipe - Raw recipe data from API
   * @returns {Object} - Normalized recipe data
   */
  normalizeRecipeData(recipe) {
    if (!recipe) return recipe;

    return {
      ...recipe,
      // Ensure arrays exist and have proper structure
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.map(ingredient => ({
            id: ingredient.id || `ingredient-${Date.now()}-${Math.random()}`,
            name: ingredient.name || '',
            quantity: ingredient.quantity || ''
          }))
        : [],
      
      steps: Array.isArray(recipe.steps) 
        ? recipe.steps.map((step, index) => ({
            id: step.id || `step-${Date.now()}-${Math.random()}`,
            step_number: step.step_number || index + 1,
            instruction: step.instruction || ''
          }))
        : [],
      
      // Ensure image URL is properly handled
      image_url: recipe.image_url || recipe.image || '',
      
      // Ensure numeric fields have proper values
      prep_time: parseInt(recipe.prep_time) || 0,
      cook_time: parseInt(recipe.cook_time) || 0,
      servings: parseInt(recipe.servings) || 1,
      average_rating: parseFloat(recipe.average_rating) || 0,
      review_count: parseInt(recipe.review_count) || 0,
      
      // Ensure string fields have defaults
      name: recipe.name || 'Untitled Recipe',
      description: recipe.description || '',
      category: recipe.category || 'makanan',
      difficulty: recipe.difficulty || 'mudah'
    };
  }

  /**
   * Prepare recipe data for API submission
   * @param {Object} recipeData - Raw recipe data from form
   * @param {Object} currentRecipe - Current recipe data (for update operations)
   * @returns {Object} - Prepared data for API
   */
  prepareRecipeData(recipeData, currentRecipe = null) {
    const preparedData = { ...recipeData };

    // Ensure ingredients array is properly formatted
    if (Array.isArray(preparedData.ingredients)) {
      preparedData.ingredients = preparedData.ingredients.map(ingredient => ({
        name: ingredient.name?.trim() || '',
        quantity: ingredient.quantity?.trim() || ''
      })).filter(ingredient => ingredient.name && ingredient.quantity);
    } else {
      preparedData.ingredients = [];
    }

    // Ensure steps array is properly formatted
    // Server expects array of strings, not objects
    if (Array.isArray(preparedData.steps)) {
      preparedData.steps = preparedData.steps
        .map((step) => {
          // If step is a string, return as-is
          if (typeof step === 'string') {
            return step.trim();
          }
          // If step is an object with instruction property, extract instruction
          if (step && step.instruction) {
            return step.instruction.trim();
          }
          // Otherwise skip
          return null;
        })
        .filter(step => step && step.length > 0);
    } else {
      preparedData.steps = [];
    }

    // Handle image URL - preserve existing if not changed
    if (!preparedData.image_url && currentRecipe?.image_url) {
      preparedData.image_url = currentRecipe.image_url;
    }

    // Ensure numeric fields are numbers
    preparedData.prep_time = parseInt(preparedData.prep_time) || 0;
    preparedData.cook_time = parseInt(preparedData.cook_time) || 0;
    preparedData.servings = parseInt(preparedData.servings) || 1;

    // Ensure string fields are trimmed
    preparedData.name = preparedData.name?.trim() || '';
    preparedData.description = preparedData.description?.trim() || '';

    // Remove any undefined or null values
    Object.keys(preparedData).forEach(key => {
      if (preparedData[key] === undefined || preparedData[key] === null) {
        delete preparedData[key];
      }
    });

    return preparedData;
  }

  /**
   * Validate recipe data before submission
   * @param {Object} recipeData - Recipe data to validate
   * @returns {Object} - Validation result { isValid: boolean, errors: string[] }
   */
  validateRecipeData(recipeData) {
    const errors = [];

    if (!recipeData.name?.trim()) {
      errors.push("Nama resep harus diisi");
    }

    if (!recipeData.description?.trim()) {
      errors.push("Deskripsi resep harus diisi");
    }

    if (!Array.isArray(recipeData.ingredients) || recipeData.ingredients.length === 0) {
      errors.push("Minimal satu bahan harus ditambahkan");
    }

    if (!Array.isArray(recipeData.steps) || recipeData.steps.length === 0) {
      errors.push("Minimal satu langkah harus ditambahkan");
    }

    if (recipeData.prep_time < 0) {
      errors.push("Waktu persiapan tidak valid");
    }

    if (recipeData.cook_time < 0) {
      errors.push("Waktu memasak tidak valid");
    }

    if (recipeData.servings < 1) {
      errors.push("Jumlah porsi tidak valid");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new RecipeService();