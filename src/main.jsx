import { StrictMode, useState, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import SplashScreen from './pages/SplashScreen';
import './index.css'
import PWABadge from './PWABadge';

// Lazy load components
const HomePage = lazy(() => import('./pages/HomePage'));
const MakananPage = lazy(() => import('./pages/MakananPage'));
const MinumanPage = lazy(() => import('./pages/MinumanPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CreateRecipePage = lazy(() => import('./pages/CreateRecipePage'));
const EditRecipePage = lazy(() => import('./pages/EditRecipePage'));
const RecipeDetail = lazy(() => import('./components/recipe/RecipeDetail'));
const DesktopNavbar = lazy(() => import('./components/navbar/DesktopNavbar'));
const MobileNavbar = lazy(() => import('./components/navbar/MobileNavbar'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-slate-600">Memuat...</p>
    </div>
  </div>
);

function AppRoot() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [mode, setMode] = useState('list'); // 'list', 'detail', 'create', 'edit'
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('makanan');
  const [editingRecipeId, setEditingRecipeId] = useState(null);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMode('list');
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateRecipe = () => {
    setMode('create');
  };

  const handleRecipeClick = (recipeId, category) => {
    setSelectedRecipeId(recipeId);
    setSelectedCategory(category || currentPage);
    setMode('detail');
  };

  const handleEditRecipe = (recipeId) => {
    console.log('🔧 Edit button clicked! Recipe ID:', recipeId);
    setEditingRecipeId(recipeId);
    setMode('edit');
    console.log('✅ Mode changed to: edit');
  };

  const handleBack = () => {
    setMode('list');
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateSuccess = (newRecipe) => {
    alert('Resep berhasil dibuat!');
    setMode('list');
    // Optionally navigate to the new recipe's category
    if (newRecipe && newRecipe.category) {
      setCurrentPage(newRecipe.category);
    }
  };

  const handleEditSuccess = (updatedRecipe) => {
    alert('Resep berhasil diperbarui!');
    setMode('list');
  };

  const renderCurrentPage = () => {
    // Show Create Recipe Page
    if (mode === 'create') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <CreateRecipePage
            onBack={handleBack}
            onSuccess={handleCreateSuccess}
          />
        </Suspense>
      );
    }

    // Show Edit Recipe Page
    if (mode === 'edit') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <EditRecipePage
            recipeId={editingRecipeId}
            onBack={handleBack}
            onSuccess={handleEditSuccess}
          />
        </Suspense>
      );
    }

    // Show Recipe Detail
    if (mode === 'detail') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <RecipeDetail
            recipeId={selectedRecipeId}
            category={selectedCategory}
            onBack={handleBack}
            onEdit={handleEditRecipe}
          />
        </Suspense>
      );
    }

    // Show List Pages
    switch (currentPage) {
      case 'home':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />
          </Suspense>
        );
      case 'makanan':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MakananPage onRecipeClick={handleRecipeClick} />
          </Suspense>
        );
      case 'minuman':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <MinumanPage onRecipeClick={handleRecipeClick} />
          </Suspense>
        );
      case 'profile':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProfilePage onRecipeClick={handleRecipeClick} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />
          </Suspense>
        );
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show navbar in list mode */}
      {mode === 'list' && (
        <>
          <Suspense fallback={null}>
            <DesktopNavbar 
              currentPage={currentPage} 
              onNavigate={handleNavigation}
              onCreateRecipe={handleCreateRecipe}
            />
          </Suspense>
          <Suspense fallback={null}>
            <MobileNavbar 
              currentPage={currentPage} 
              onNavigate={handleNavigation}
              onCreateRecipe={handleCreateRecipe}
            />
          </Suspense>
        </>
      )}
      
      {/* Main Content */}
      <main className="min-h-screen">
        {renderCurrentPage()}
      </main>

      <PWABadge />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)