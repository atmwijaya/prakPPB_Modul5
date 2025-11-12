const DRAFT_KEY_PREFIX = "recipe_draft_";
const DRAFT_TIMESTAMP_KEY = "recipe_draft_timestamp";
const USER_PROFILE_KEY = "user_profile";
const REVIEWS_KEY = "recipe_reviews";
const FAVORITES_KEY = "user_favorites";

/**
 * Save recipe draft to localStorage
 * @param {Object} draftData - Recipe draft data
 * @param {string} draftId - Unique identifier for the draft (e.g., 'create' or recipeId for edit)
 */
export const saveDraft = (draftData, draftId = "create") => {
  try {
    const key =
      draftId === "user_profile"
        ? USER_PROFILE_KEY
        : draftId === FAVORITES_KEY
        ? FAVORITES_KEY
        : `${DRAFT_KEY_PREFIX}${draftId}`;
    const timestamp = new Date().toISOString();

    const draft = {
      ...draftData,
      savedAt: timestamp,
    };

    localStorage.setItem(key, JSON.stringify(draft));

    if (draftId !== "user_profile" && draftId !== FAVORITES_KEY) {
      localStorage.setItem(`${key}_${DRAFT_TIMESTAMP_KEY}`, timestamp);
    }

    console.log(`Draft saved: ${draftId} at ${timestamp}`);
    return true;
  } catch (error) {
    console.error("Error saving draft:", error);
    return false;
  }
};

/**
 * Load recipe draft from localStorage
 * @param {string} draftId - Unique identifier for the draft
 * @returns {Object|null} Draft data or null if not found
 */
export const loadDraft = (draftId = "create") => {
  try {
    const key =
      draftId === "user_profile"
        ? USER_PROFILE_KEY
        : draftId === FAVORITES_KEY
        ? FAVORITES_KEY
        : `${DRAFT_KEY_PREFIX}${draftId}`;
    const draftJson = localStorage.getItem(key);

    if (!draftJson) {
      return null;
    }

    const draft = JSON.parse(draftJson);
    console.log(`Draft loaded: ${draftId}`);
    return draft;
  } catch (error) {
    console.error("Error loading draft:", error);
    return null;
  }
};

/**
 * Save user review
 * @param {Object} reviewData - Review data
 */
export const saveReview = (reviewData) => {
  try {
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
    const newReview = {
      ...reviewData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    reviews.push(newReview);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

    console.log("Review saved:", newReview);
    return newReview;
  } catch (error) {
    console.error("Error saving review:", error);
    return null;
  }
};

/**
 * Load user reviews
 * @param {string} userIdentifier - User identifier
 * @returns {Array} User reviews
 */
export const loadUserReviews = (userIdentifier) => {
  try {
    const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
    return reviews.filter(
      (review) => review.user_identifier === userIdentifier
    );
  } catch (error) {
    console.error("Error loading user reviews:", error);
    return [];
  }
};

/**
 * Save user favorites
 * @param {Object} favoritesData - Favorites data
 */
export const saveFavorites = (favoritesData) => {
  try {
    // Save directly as array
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesData));
    console.log("Favorites saved:", favoritesData);
    return true;
  } catch (error) {
    console.error("Error saving favorites:", error);
    return false;
  }
};

/**
 * Load user favorites
 * @returns {Array} User favorites
 */
export const loadFavorites = () => {
  try {
    const favoritesData = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    // Handle both old format {items: []} and new format []
    if (Array.isArray(favoritesData)) {
      return favoritesData;
    }
    return favoritesData?.items || [];
  } catch (error) {
    console.error("Error loading favorites:", error);
    return [];
  }
};

/**
 * Add recipe to favorites
 * @param {Object} recipe - Recipe data
 */
export const addToFavorites = (recipe) => {
  try {
    const favorites = loadFavorites();
    
    // Ensure all required fields have values with defaults
    const favoriteRecipe = {
      id: recipe.id || Date.now(),
      name: recipe.name || "Unnamed Recipe",
      description: recipe.description || "",
      image_url: recipe.image_url || "",
      category: recipe.category || "makanan",
      prep_time: recipe.prep_time || recipe.cook_time || "15",
      cook_time: recipe.cook_time || "15",
      difficulty: recipe.difficulty || "mudah",
      average_rating: recipe.average_rating || 0,
      servings: recipe.servings || 4,
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      added_at: new Date().toISOString()
    };
    
    const existingIndex = favorites.findIndex(fav => fav.id === recipe.id);
    if (existingIndex === -1) {
      favorites.push(favoriteRecipe);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      console.log("Recipe added to favorites:", favoriteRecipe);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

/**
 * Remove recipe from favorites
 * @param {string} recipeId - Recipe ID
 */
export const removeFromFavorites = (recipeId) => {
  try {
    const favorites = loadFavorites();
    const updatedFavorites = favorites.filter((fav) => fav.id !== recipeId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    console.log("Recipe removed from favorites:", recipeId);
    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return false;
  }
};

/**
 * Check if recipe is favorited
 * @param {string} recipeId - Recipe ID
 * @returns {boolean} True if favorited
 */
export const isRecipeFavorited = (recipeId) => {
  try {
    const favorites = loadFavorites();
    return favorites.some((fav) => fav.id === recipeId);
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
};

/**
 * Delete recipe draft from localStorage
 * @param {string} draftId - Unique identifier for the draft
 */
export const deleteDraft = (draftId = "create") => {
  try {
    const key =
      draftId === "user_profile"
        ? USER_PROFILE_KEY
        : draftId === FAVORITES_KEY
        ? FAVORITES_KEY
        : `${DRAFT_KEY_PREFIX}${draftId}`;
    localStorage.removeItem(key);

    if (draftId !== "user_profile" && draftId !== FAVORITES_KEY) {
      localStorage.removeItem(`${key}_${DRAFT_TIMESTAMP_KEY}`);
    }

    console.log(`Draft deleted: ${draftId}`);
    return true;
  } catch (error) {
    console.error("Error deleting draft:", error);
    return false;
  }
};

/**
 * Check if a draft exists
 * @param {string} draftId - Unique identifier for the draft
 * @returns {boolean} True if draft exists
 */
export const hasDraft = (draftId = "create") => {
  try {
    const key =
      draftId === "user_profile"
        ? USER_PROFILE_KEY
        : draftId === FAVORITES_KEY
        ? FAVORITES_KEY
        : `${DRAFT_KEY_PREFIX}${draftId}`;
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error("Error checking draft:", error);
    return false;
  }
};

/**
 * Get draft timestamp
 * @param {string} draftId - Unique identifier for the draft
 * @returns {string|null} ISO timestamp or null
 */
export const getDraftTimestamp = (draftId = "create") => {
  try {
    const key = `${DRAFT_KEY_PREFIX}${draftId}`;
    return localStorage.getItem(`${key}_${DRAFT_TIMESTAMP_KEY}`);
  } catch (error) {
    console.error("Error getting draft timestamp:", error);
    return null;
  }
};

/**
 * Get all draft IDs
 * @returns {string[]} Array of draft IDs
 */
export const getAllDraftIds = () => {
  try {
    const keys = Object.keys(localStorage);
    const draftKeys = keys.filter(
      (key) =>
        key.startsWith(DRAFT_KEY_PREFIX) && !key.includes(DRAFT_TIMESTAMP_KEY)
    );
    return draftKeys.map((key) => key.replace(DRAFT_KEY_PREFIX, ""));
  } catch (error) {
    console.error("Error getting all draft IDs:", error);
    return [];
  }
};

/**
 * Clear all recipe drafts
 */
export const clearAllDrafts = () => {
  try {
    const draftIds = getAllDraftIds();
    draftIds.forEach((id) => deleteDraft(id));
    console.log(`Cleared ${draftIds.length} drafts`);
    return true;
  } catch (error) {
    console.error("Error clearing all drafts:", error);
    return false;
  }
};

/**
 * Format draft timestamp for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time ago
 */
export const formatDraftTime = (timestamp) => {
  if (!timestamp) return "";

  const now = new Date();
  const savedTime = new Date(timestamp);
  const diffMs = now - savedTime;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  return savedTime.toLocaleDateString("id-ID");
};
