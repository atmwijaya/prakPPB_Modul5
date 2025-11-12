import { useState, useEffect } from "react";
import { useLocalStorageValue } from "../hooks/useLocalStorage";
import {
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,
  formatDraftTime,
  addToFavorites,
  loadFavorites,
  removeFromFavorites,
  loadUserReviews,
} from "../utils/draftStorage";
import {
  Edit,
  Save,
  X,
  Camera,
  Heart,
  Star,
  Clock,
  Utensils,
  Coffee,
  Trash2, ChefHat
} from "lucide-react";

export default function ProfilePage({ onRecipeClick }) {
  const [userProfile, setUserProfile] = useState({
    username: "Pengguna",
    avatar: "",
    bio: "Pecinta masakan lezat dan minuman segar",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("favorites"); // 'favorites', 'reviews'

  // Use custom hook to monitor localStorage changes
  const favoritesFromStorage = useLocalStorageValue("user_favorites", []);
  const reviewsFromStorage = useLocalStorageValue("recipe_reviews", []);

  const [favorites, setFavorites] = useState([]);
  const [userReviews, setUserReviews] = useState([]);

  const anggotaKelompok = [
    {
      id: 1,
      nama: "Arrasyid Atma Wijaya",
      nim: "21120123140114",
      avatar: "https://avatars.githubusercontent.com/atmwijaya",
    },
    {
      id: 2,
      nama: "Kevin Ilham Ramadhan",
      nim: "21120123130098",
      avatar: "https://avatars.githubusercontent.com/kevinilhamramadhan",
    },
    {
      id: 3,
      nama: "Abdullah Fatih Azzam",
      nim: "21120123140118",
      avatar: "https://avatars.githubusercontent.com/ItsFito",
    },
  ];

  // Load user profile and data from localStorage
  useEffect(() => {
    const savedProfile = loadDraft("user_profile");
    if (savedProfile) {
      setUserProfile(savedProfile);
    }
  }, []);

  // Update favorites whenever storage changes
  useEffect(() => {
    try {
      setFavorites(favoritesFromStorage || []);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  }, [favoritesFromStorage]);

  // Update user reviews whenever storage changes
  useEffect(() => {
    try {
      const filteredReviews = (reviewsFromStorage || []).filter(
        (review) => review.user_identifier === userProfile.username
      );
      setUserReviews(filteredReviews);
    } catch (error) {
      console.error("Error updating reviews:", error);
    }
  }, [reviewsFromStorage, userProfile.username]);

  const handleSaveProfile = () => {
    saveDraft(userProfile, "user_profile");
    setIsEditing(false);
    alert("Profil berhasil disimpan!");
  };

  const handleCancelEdit = () => {
    const savedProfile = loadDraft("user_profile") || {
      username: "Pengguna",
      avatar: "",
      bio: "Pecinta masakan lezat dan minuman segar",
    };
    setUserProfile(savedProfile);
    setIsEditing(false);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserProfile((prev) => ({
          ...prev,
          avatar: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setUserProfile((prev) => ({
      ...prev,
      avatar: "",
    }));
  };

  const handleRemoveFavorite = async (recipeId, event) => {
    event.stopPropagation();
    if (window.confirm("Hapus dari favorit?")) {
      const success = removeFromFavorites(recipeId);
      if (success) {
        // Update local state will be triggered automatically by the useLocalStorageValue hook
        alert("Resep berhasil dihapus dari favorit!");
      }
    }
  };

  const handleRemoveReview = (reviewId, event) => {
    event.stopPropagation();
    if (window.confirm("Hapus ulasan ini?")) {
      const allReviews = JSON.parse(
        localStorage.getItem("recipe_reviews") || "[]"
      );
      const updatedReviews = allReviews.filter(
        (review) => review.id !== reviewId
      );
      localStorage.setItem("recipe_reviews", JSON.stringify(updatedReviews));
      setUserReviews(
        updatedReviews.filter(
          (review) => review.user_identifier === userProfile.username
        )
      );
      alert("Ulasan berhasil dihapus!");
    }
  };

  const getFavoriteStats = () => {
    const makananFav = favorites.filter(
      (fav) => fav.category === "makanan"
    ).length;
    const minumanFav = favorites.filter(
      (fav) => fav.category === "minuman"
    ).length;

    return {
      total: favorites.length,
      makanan: makananFav,
      minuman: minumanFav,
    };
  };

  const getReviewStats = () => {
    const totalRating = userReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      userReviews.length > 0 ? totalRating / userReviews.length : 0;

    return {
      total: userReviews.length,
      average: averageRating.toFixed(1),
    };
  };

  const favoriteStats = getFavoriteStats();
  const reviewStats = getReviewStats();

  const renderFavoritesList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Belum ada resep favorit</p>
          <p className="text-gray-400">
            Resep yang Anda favoritkan akan muncul di sini
          </p>
        </div>
      ) : (
        favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
            onClick={() => onRecipeClick(favorite.id, favorite.category)}
          >
            {/* Recipe Image */}
            <div className="relative h-48 overflow-hidden">
              {favorite.image_url ? (
                <img
                  src={favorite.image_url}
                  alt={favorite.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    favorite.category === "makanan"
                      ? "bg-gradient-to-br from-blue-100 to-blue-200"
                      : "bg-gradient-to-br from-green-100 to-green-200"
                  }`}
                >
                  {favorite.category === "makanan" ? (
                    <Utensils className="w-12 h-12 text-blue-600" />
                  ) : (
                    <Coffee className="w-12 h-12 text-green-600" />
                  )}
                </div>
              )}

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    favorite.category === "makanan"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                  }`}
                >
                  {favorite.category === "makanan" ? "Makanan" : "Minuman"}
                </span>
              </div>

              {/* Rating Badge */}
              {favorite.average_rating > 0 && (
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-semibold text-slate-700">
                    {favorite.average_rating.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Remove Favorite Button */}
              <button
                onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                className="absolute bottom-3 right-3 bg-white/80 hover:bg-white text-red-500 p-2 rounded-full transition-colors backdrop-blur-sm"
                title="Hapus dari favorit"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Recipe Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                {favorite.name}
              </h3>

              {favorite.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {favorite.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>
                    {favorite.prep_time || favorite.cook_time || 15} menit
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                  <ChefHat className="w-4 h-4" />
                  <span className="capitalize">
                    {favorite.difficulty || "mudah"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderReviewsList = () => (
    <div className="space-y-6">
      {userReviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">Belum ada ulasan</p>
          <p className="text-gray-400">
            Ulasan yang Anda berikan akan muncul di sini
          </p>
        </div>
      ) : (
        userReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
            onClick={() => onRecipeClick(review.recipe_id, review.category)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {review.recipe_name}
                </h3>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= review.rating
                            ? "text-amber-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDraftTime(review.created_at)}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => handleRemoveReview(review.id, e)}
                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                title="Hapus ulasan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {review.comment && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto">
        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200 bg-gray-100">
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {userProfile.username.charAt(0)}
                  </div>
                )}
              </div>

              {isEditing && (
                <>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                  {userProfile.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={userProfile.username}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="text-2xl font-bold text-gray-800 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full"
                    placeholder="Username"
                  />
                  <textarea
                    value={userProfile.bio}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    className="text-gray-600 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 w-full resize-none"
                    placeholder="Bio"
                    rows="2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Simpan
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {userProfile.username}
                  </h1>
                  <p className="text-gray-600 mb-4">{userProfile.bio}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profil
                  </button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Heart className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-600">
                  {favoriteStats.total}
                </p>
                <p className="text-xs text-gray-500">Favorit</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Star className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-600">
                  {reviewStats.total}
                </p>
                <p className="text-xs text-gray-500">Ulasan</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-purple-600">
                  {reviewStats.average}
                </p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Favorites Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Resep Favorit
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Favorit</span>
                <span className="font-semibold">
                  {favoriteStats.total} resep
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Makanan</span>
                <span className="font-semibold text-blue-600">
                  {favoriteStats.makanan} resep
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Minuman</span>
                <span className="font-semibold text-green-600">
                  {favoriteStats.minuman} resep
                </span>
              </div>
            </div>
          </div>

          {/* Reviews Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Statistik Ulasan
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Ulasan</span>
                <span className="font-semibold">
                  {reviewStats.total} ulasan
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rating Rata-rata</span>
                <span className="font-semibold text-amber-500">
                  {reviewStats.average}/5
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Aktif Sejak</span>
                <span className="font-semibold text-gray-600">-</span>
              </div>
            </div>
          </div>
        </div>

        {/* Favorites and Reviews Tabs */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "favorites"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Heart className="w-5 h-5" />
              Resep Favorit ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Star className="w-5 h-5" />
              Ulasan Saya ({userReviews.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "favorites"
              ? renderFavoritesList()
              : renderReviewsList()}
          </div>
        </div>

        {/* Team Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Anggota Kelompok
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anggotaKelompok.map((anggota, index) => (
              <div
                key={anggota.id}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow duration-300 border border-gray-200"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden shadow-md border-2 border-white">
                  <img
                    src={anggota.avatar}
                    alt={`Avatar ${anggota.nama}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    style={{ display: "none" }}
                  >
                    {anggota.nama.charAt(0)}
                  </div>
                </div>

                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {index + 1}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {anggota.nama}
                </h3>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">NIM:</span> {anggota.nim}
                </p>
                <p className="text-sm text-gray-500">Anggota</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
