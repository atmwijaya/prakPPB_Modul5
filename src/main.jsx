import { StrictMode, useState, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import SplashScreen from './pages/SplashScreen';
import './index.css'
import PWABadge from './PWABadge';

// Create a client dengan konfigurasi caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 2,
    },
  },
});

// PROPER LAZY LOADING dengan dynamic import
const HomePage = lazy(() => import(/* webpackChunkName: "home" */ './pages/HomePage'));
const MakananPage = lazy(() => import(/* webpackChunkName: "makanan" */ './pages/MakananPage'));
const MinumanPage = lazy(() => import(/* webpackChunkName: "minuman" */ './pages/MinumanPage'));
const ProfilePage = lazy(() => import(/* webpackChunkName: "profile" */ './pages/ProfilePage'));
const CreateRecipePage = lazy(() => import(/* webpackChunkName: "create" */ './pages/CreateRecipePage'));
const EditRecipePage = lazy(() => import(/* webpackChunkName: "edit" */ './pages/EditRecipePage'));
const RecipeDetail = lazy(() => import(/* webpackChunkName: "detail" */ './components/recipe/RecipeDetail'));
const DesktopNavbar = lazy(() => import(/* webpackChunkName: "desktop-nav" */ './components/navbar/DesktopNavbar'));
const MobileNavbar = lazy(() => import(/* webpackChunkName: "mobile-nav" */ './components/navbar/MobileNavbar'));

// Better Loading component dengan proper lazy loading indicator
const PageLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
      <p className="text-slate-600 text-lg">Memuat halaman...</p>
    </div>
  </div>
);

// Component untuk handle recipe detail dari URL
function RecipeDetailFromUrl() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
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
    <Suspense fallback={<PageLoadingSpinner />}>
      <RecipeDetail
        recipeId={id}
        category={category}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </Suspense>
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
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
    queryClient.invalidateQueries({ queryKey: ['recipe', id] });
    
    alert('Resep berhasil diperbarui!');
    if (updatedRecipe && updatedRecipe.category) {
      navigate(`/recipe/${updatedRecipe.category}/${id}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <EditRecipePage
        recipeId={id}
        onBack={handleBack}
        onSuccess={handleSuccess}
      />
    </Suspense>
  );
}

// Preload komponen yang sering diakses
const preloadComponents = () => {
  // Preload komponen utama setelah splash screen
  const componentsToPreload = [
    import('./pages/HomePage'),
    import('./pages/MakananPage'),
    import('./pages/MinumanPage'),
    import('./components/navbar/DesktopNavbar'),
    import('./components/navbar/MobileNavbar')
  ];
  
  Promise.all(componentsToPreload).then(() => {
    console.log('Main components preloaded');
  });
};

// Main App Component dengan Router
function AppWithRouter() {
  const [showSplash, setShowSplash] = useState(true);
  const [preloaded, setPreloaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Start preloading setelah splash screen
    if (!preloaded) {
      preloadComponents();
      setPreloaded(true);
    }
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
    queryClient.invalidateQueries({ queryKey: ['recipes'] });
    
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
          <Suspense fallback={<NavbarLoading />}>
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
              <Suspense fallback={<PageLoadingSpinner />}>
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
              <Suspense fallback={<PageLoadingSpinner />}>
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
              <Suspense fallback={<PageLoadingSpinner />}>
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
              <Suspense fallback={<PageLoadingSpinner />}>
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
              <Suspense fallback={<PageLoadingSpinner />}>
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
            element={<EditRecipeFromUrl />}
          />
          
          {/* Recipe Detail Route - SHAREABLE URL */}
          <Route 
            path="/recipe/:category/:id" 
            element={<RecipeDetailFromUrl />}
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
      
      {/* React Query Devtools - hanya di development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </div>
  );
}

// Loading component untuk navbar
const NavbarLoading = () => (
  <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="bg-slate-200 animate-pulse h-8 w-32 rounded"></div>
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-slate-200 animate-pulse h-8 w-20 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  </nav>
);

// Root App Component dengan Query Provider
function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppWithRouter />
      </Router>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)