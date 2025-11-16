import { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import RecipeGrid from '../components/minuman/RecipeGrid';
import AdvancedFilter from '../components/common/AdvancedFilter';

export default function MinumanPage({ onRecipeClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    sortBy: 'created_at',
    order: 'desc',
    prepTimeMax: '',
  });
  const [page, setPage] = useState(1);

  // Fetch recipes dengan React Query caching
  const { recipes, loading, error, pagination, isFetching, refetch } = useRecipes({
    category: 'minuman',
    search: searchQuery || undefined,
    difficulty: filters.difficulty || undefined,
    page,
    limit: 12,
    sort_by: filters.sortBy,
    order: filters.order
  });

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Client-side filter untuk prep time
  const filteredRecipes = filters.prepTimeMax
    ? recipes.filter(recipe => {
        const prepTime = parseInt(recipe.prep_time);
        return !isNaN(prepTime) && prepTime <= parseInt(filters.prepTimeMax);
      })
    : recipes;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-cyan-50 pb-20 md:pb-8">
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
            Resep Minuman
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Temukan berbagai resep minuman segar dan nikmat
          </p>
        </div>

        {/* Advanced Filter */}
        <AdvancedFilter
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          initialFilters={{ ...filters, search: searchQuery }}
        />

        {/* Background Fetching Indicator */}
        {isFetching && !loading && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            Memperbarui data...
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Memuat resep...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-semibold mb-2">Terjadi Kesalahan</p>
              <p className="text-red-500">{error}</p>
              <button
                onClick={refetch}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && !error && (
          <>
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  {searchQuery || filters.difficulty || filters.prepTimeMax 
                    ? "Tidak ada resep yang sesuai dengan filter" 
                    : "Belum ada resep minuman"
                  }
                </p>
                <p className="text-gray-500 mt-2">
                  Coba ubah filter atau kata kunci pencarian
                </p>
              </div>
            ) : (
              <RecipeGrid recipes={filteredRecipes} onRecipeClick={onRecipeClick} />
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white/80 backdrop-blur border border-slate-300 rounded-xl hover:bg-green-50 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-slate-700"
                >
                  ← Sebelumnya
                </button>

                <div className="flex flex-col md:flex-row items-center gap-2 bg-white/60 backdrop-blur px-4 py-2 rounded-xl border border-white/40">
                  <span className="text-slate-700 font-semibold">
                    Halaman {pagination.page} dari {pagination.total_pages}
                  </span>
                  <span className="text-slate-500 text-sm">
                    ({pagination.total} resep)
                  </span>
                </div>

                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.total_pages}
                  className="px-6 py-3 bg-white/80 backdrop-blur border border-slate-300 rounded-xl hover:bg-green-50 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-slate-700"
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}