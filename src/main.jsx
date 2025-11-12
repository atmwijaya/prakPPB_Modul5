import { StrictMode, useState, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom'
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

// Component untuk handle recipe detail dari URL
function RecipeDetailFromUrl() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Jika datang dari external link, redirect ke home
    if (location.state?.fromExternal) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  const handleEdit = (recipeId) => {
    navigate(`/edit/${recipeId}`);
  };

  return (
    <RecipeDetail
      recipeId={id}
      category={category}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}

// Component untuk handle edit dari URL
function EditRecipeFromUrl() {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleSuccess = (updatedRecipe) => {
    alert('Resep berhasil diperbarui!');
    if (updatedRecipe && updatedRecipe.category) {
      navigate(`/recipe/${updatedRecipe.category}/${id}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <EditRecipePage
      recipeId={id}
      onBack={handleBack}
      onSuccess={handleSuccess}
    />
  );
}

// Main App Component dengan Router
function AppWithRouter() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigation = (page) => {
    navigate(`/${page === 'home' ? '' : page}`);
  };

  const handleCreateRecipe = () => {
    navigate('/create');
  };

  const handleRecipeClick = (recipeId, category = 'makanan') => {
    navigate(`/recipe/${category}/${recipeId}`);
  };

  const handleEditRecipe = (recipeId) => {
    navigate(`/edit/${recipeId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreateSuccess = (newRecipe) => {
    alert('Resep berhasil dibuat!');
    if (newRecipe && newRecipe.category) {
      navigate(`/recipe/${newRecipe.category}/${newRecipe.id}`);
    } else {
      navigate('/makanan');
    }
  };

  // Get current page from URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/' || path === '') return 'home';
    if (path.startsWith('/makanan')) return 'makanan';
    if (path.startsWith('/minuman')) return 'minuman';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/create')) return 'create';
    if (path.startsWith('/edit')) return 'edit';
    if (path.startsWith('/recipe')) return 'detail';
    return 'home';
  };

  const currentPage = getCurrentPage();

  // Check if we're in detail/edit/create mode
  const isDetailMode = currentPage === 'detail';
  const isEditMode = currentPage === 'edit';
  const isCreateMode = currentPage === 'create';

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show navbar in list mode */}
      {!isDetailMode && !isEditMode && !isCreateMode && (
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
        <Routes>
          {/* Home Route */}
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <HomePage 
                  onRecipeClick={handleRecipeClick} 
                  onNavigate={handleNavigation} 
                />
              </Suspense>
            } 
          />
          
          {/* Makanan Route */}
          <Route 
            path="/makanan" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <MakananPage 
                  onRecipeClick={handleRecipeClick} 
                />
              </Suspense>
            } 
          />
          
          {/* Minuman Route */}
          <Route 
            path="/minuman" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <MinumanPage 
                  onRecipeClick={handleRecipeClick} 
                />
              </Suspense>
            } 
          />
          
          {/* Profile Route */}
          <Route 
            path="/profile" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ProfilePage 
                  onRecipeClick={handleRecipeClick} 
                />
              </Suspense>
            } 
          />
          
          {/* Create Recipe Route */}
          <Route 
            path="/create" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CreateRecipePage
                  onBack={handleBack}
                  onSuccess={handleCreateSuccess}
                />
              </Suspense>
            } 
          />
          
          {/* Edit Recipe Route */}
          <Route 
            path="/edit/:id" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <EditRecipeFromUrl />
              </Suspense>
            } 
          />
          
          {/* Recipe Detail Route - SHAREABLE URL */}
          <Route 
            path="/recipe/:category/:id" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <RecipeDetailFromUrl />
              </Suspense>
            } 
          />
          
          {/* Fallback Route */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-slate-800 mb-4">Halaman Tidak Ditemukan</h1>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Kembali ke Home
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </main>

      <PWABadge />
    </div>
  );
}

// Root App Component
function AppRoot() {
  return (
    <Router>
      <AppWithRouter />
    </Router>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)