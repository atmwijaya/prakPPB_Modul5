import { apiClient } from "../config/api";

const REVIEWS_KEY = "recipe_reviews";

class ReviewService {
  /**
   * Get all reviews for a recipe
   * @param {string} recipeId - Recipe ID
   * @returns {Promise}
   */
  async getReviews(recipeId) {
    try {
      // Try to get from API first
      try {
        const response = await apiClient.get(
          `/api/v1/recipes/${recipeId}/reviews`
        );
        return response;
      } catch (apiError) {
        // Fallback to localStorage
        const reviews = this.getReviewsFromStorage(recipeId);
        return { success: true, data: reviews };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get reviews from localStorage
   * @param {string} recipeId - Recipe ID
   * @returns {Array} Reviews array
   */
  getReviewsFromStorage(recipeId) {
    try {
      const allReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
      return allReviews.filter((review) => review.recipe_id === recipeId);
    } catch (error) {
      console.error("Error getting reviews from storage:", error);
      return [];
    }
  }

  /**
* Create review for a recipe
* @param {string} recipeId - Recipe ID
* @param {Object} reviewData - Review data
* @param {string} reviewData.user_identifier - User
identifier
* @param {number} reviewData.rating - Rating (1-5)
* @param {string} reviewData.comment - Review comment
(optional)
* @returns {Promise}
*/
  async createReview(recipeId, reviewData) {
    try {
      const response = await apiClient.post(
        `/api/v1/recipes/${recipeId}/reviews`,
        reviewData
      );
      
      // Also save to localStorage for persistence
      if (response.success || response.data) {
        this.saveReviewToStorage(recipeId, reviewData);
      }
      
      return response;
    } catch (error) {
      // Fallback: Save to localStorage even if API fails
      console.warn("API error, saving to localStorage:", error);
      this.saveReviewToStorage(recipeId, reviewData);
      return { success: true, data: reviewData, offline: true };
    }
  }

  /**
   * Save review to localStorage
   * @param {string} recipeId - Recipe ID
   * @param {Object} reviewData - Review data
   */
  saveReviewToStorage(recipeId, reviewData) {
    try {
      const allReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
      
      const newReview = {
        id: Date.now().toString(),
        recipe_id: recipeId,
        recipe_name: reviewData.recipe_name,
        category: reviewData.category,
        user_identifier: reviewData.user_identifier,
        rating: reviewData.rating,
        comment: reviewData.comment || "",
        created_at: new Date().toISOString(),
      };

      allReviews.push(newReview);
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
      console.log("Review saved to localStorage:", newReview);
      return newReview;
    } catch (error) {
      console.error("Error saving review to storage:", error);
      return null;
    }
  }
  /**
* Update existing review
* @param {string} reviewId - Review ID
* @param {Object} reviewData - Updated review data
* @param {number} reviewData.rating - Rating (1-5)
* @param {string} reviewData.comment - Review comment
(optional)
* @returns {Promise}
*/
  async updateReview(reviewId, reviewData) {
    try {
      const response = await apiClient.put(
        `/api/v1/reviews/${reviewId}`,
        reviewData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Delete review
   * @param {string} reviewId - Review ID
   * @returns {Promise}
   */
  async deleteReview(reviewId) {
    try {
      const response = await apiClient.delete(`/api/v1/reviews/${reviewId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
export default new ReviewService();
