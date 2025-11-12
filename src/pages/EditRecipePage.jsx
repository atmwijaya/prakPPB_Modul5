
import { useState, useEffect } from "react";
import { useRecipe, useUpdateRecipe } from "../hooks/useRecipes";
import uploadService from "../services/uploadService";
import { Save, X, Plus, Trash2, Upload, Loader } from "lucide-react";

export default function EditRecipePage({ recipeId, onSave, onCancel }) {
  const { recipe, loading: recipeLoading, error: recipeError, refetch } = useRecipe(recipeId);
  const { updateRecipe, loading: updateLoading } = useUpdateRecipe();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "makanan",
    difficulty: "mudah",
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    image_url: "",
    ingredients: [],
    steps: []
  });

  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "" });
  const [newStep, setNewStep] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  // Initialize form data when recipe is loaded
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || "",
        description: recipe.description || "",
        category: recipe.category || "makanan",
        difficulty: recipe.difficulty || "mudah",
        prep_time: recipe.prep_time || 0,
        cook_time: recipe.cook_time || 0,
        servings: recipe.servings || 1,
        image_url: recipe.image_url || "",
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || []
      });
    }
  }, [recipe]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleAddIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.quantity.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            id: Date.now().toString(),
            name: newIngredient.name.trim(),
            quantity: newIngredient.quantity.trim()
          }
        ]
      }));
      setNewIngredient({ name: "", quantity: "" });
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleAddStep = () => {
    if (newStep.trim()) {
      setFormData(prev => ({
        ...prev,
        steps: [
          ...prev.steps,
          {
            id: Date.now().toString(),
            step_number: prev.steps.length + 1,
            instruction: newStep.trim()
          }
        ]
      }));
      setNewStep("");
    }
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = formData.steps.filter((_, i) => i !== index)
      .map((step, idx) => ({
        ...step,
        step_number: idx + 1
      }));
    
    setFormData(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      instruction: value
    };
    setFormData(prev => ({
      ...prev,
      steps: updatedSteps
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImageUploading(true);
      setImageError("");

      // Upload image to server
      const uploadResult = await uploadService.uploadImage(file);
      
      if (uploadResult.success && uploadResult.data?.url) {
        setFormData(prev => ({
          ...prev,
          image_url: uploadResult.data.url
        }));
      } else {
        throw new Error(uploadResult.message || "Upload gagal");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageError(error.message || "Gagal mengupload gambar");
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ""
    }));
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      callback();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert("Nama resep harus diisi");
      return;
    }

    if (!formData.description.trim()) {
      alert("Deskripsi resep harus diisi");
      return;
    }

    if (formData.ingredients.length === 0) {
      alert("Minimal satu bahan harus ditambahkan");
      return;
    }

    if (formData.steps.length === 0) {
      alert("Minimal satu langkah harus ditambahkan");
      return;
    }

    try {
      const result = await updateRecipe(recipeId, formData);
      if (result) {
        // Refresh the recipe data
        await refetch();
        onSave?.(result);
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      alert("Gagal menyimpan resep: " + (error.message || "Terjadi kesalahan"));
    }
  };

  if (recipeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat resep...</p>
        </div>
      </div>
    );
  }

  if (recipeError || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {recipeError || "Resep tidak ditemukan"}</p>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Resep</h1>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={updateLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {updateLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Resep *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Masukkan nama resep"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="makanan">Makanan</option>
                  <option value="minuman">Minuman</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tingkat Kesulitan *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="mudah">Mudah</option>
                  <option value="sedang">Sedang</option>
                  <option value="sulit">Sulit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porsi *
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleNumberInputChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Persiapan (menit) *
                </label>
                <input
                  type="number"
                  name="prep_time"
                  value={formData.prep_time}
                  onChange={handleNumberInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Memasak (menit) *
                </label>
                <input
                  type="number"
                  name="cook_time"
                  value={formData.cook_time}
                  onChange={handleNumberInputChange}
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Deskripsikan resep Anda..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar Resep
              </label>
              {imageError && (
                <p className="text-red-600 text-sm mb-2">{imageError}</p>
              )}
              <div className="flex items-center gap-4">
                {formData.image_url ? (
                  <>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center w-32 h-32 flex items-center justify-center">
                    {imageUploading ? (
                      <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Upload gambar</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={imageUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Bahan-bahan *
              </label>
              
              {/* Add Ingredient Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nama bahan"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => handleKeyPress(e, handleAddIngredient)}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredient.quantity}
                    onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Jumlah"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyPress={(e) => handleKeyPress(e, handleAddIngredient)}
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    disabled={!newIngredient.name.trim() || !newIngredient.quantity.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2">
                {formData.ingredients.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada bahan-bahan</p>
                ) : (
                  formData.ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-gray-700">
                        <strong>{ingredient.name}</strong> - {ingredient.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Steps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Langkah-langkah *
              </label>
              
              {/* Add Step Form */}
              <div className="flex gap-2 mb-4">
                <textarea
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  placeholder="Tulis langkah memasak..."
                  rows="2"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddStep())}
                />
                <button
                  type="button"
                  onClick={handleAddStep}
                  disabled={!newStep.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed self-start"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {formData.steps.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada langkah-langkah</p>
                ) : (
                  formData.steps.map((step, index) => (
                    <div key={step.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {step.step_number}
                      </span>
                      <textarea
                        value={step.instruction}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        rows="2"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder="Tulis langkah..."
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(index)}
                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-100 rounded-lg self-start transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}