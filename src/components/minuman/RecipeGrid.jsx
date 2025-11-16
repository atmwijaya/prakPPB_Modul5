import { Clock, Star, Coffee, ChefHat } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import FavoriteButton from '../common/FavoriteButton';

export default function RecipeGrid({ recipes, onRecipeClick }) {
  const [visibleCards, setVisibleCards] = useState(new Set());
  const [loadedImages, setLoadedImages] = useState(new Set());
  const cardRefs = useRef([]);
  const imgRefs = useRef([]);

  // Observer untuk animasi kartu
  useEffect(() => {
    if (recipes.length === 0) return;

    cardRefs.current = cardRefs.current.slice(0, recipes.length);
    
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setTimeout(() => {
            setVisibleCards(prev => new Set(prev).add(index));
          }, (index % 3) * 150);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '20px'
    });

    cardRefs.current.forEach((ref, index) => {
      if (ref) {
        ref.dataset.index = index;
        cardObserver.observe(ref);
      }
    });

    return () => {
      cardObserver.disconnect();
    };
  }, [recipes]);

  // Observer untuk lazy loading gambar
  useEffect(() => {
    if (recipes.length === 0) return;

    imgRefs.current = imgRefs.current.slice(0, recipes.length);
    
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.dataset.index);
          setLoadedImages(prev => {
            const newSet = new Set(prev);
            newSet.add(index);
            return newSet;
          });
          imgObserver.unobserve(entry.target);
        }
      });
    }, { 
      threshold: 0.01,
      rootMargin: '100px'
    });

    // Observe semua gambar yang belum diload
    imgRefs.current.forEach((ref, index) => {
      if (ref && !loadedImages.has(index)) {
        ref.dataset.index = index;
        imgObserver.observe(ref);
      }
    });

    // Fallback: Load gambar yang terlihat saat ini
    const timeoutId = setTimeout(() => {
      imgRefs.current.forEach((ref, index) => {
        if (ref && !loadedImages.has(index)) {
          const rect = ref.getBoundingClientRect();
          const isVisible = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
          
          if (isVisible) {
            setLoadedImages(prev => {
              const newSet = new Set(prev);
              newSet.add(index);
              return newSet;
            });
          }
        }
      });
    }, 500);

    return () => {
      imgObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [recipes, loadedImages]);

  // Preload gambar pertama untuk UX yang lebih baik
  useEffect(() => {
    if (recipes.length > 0 && !loadedImages.has(0)) {
      setLoadedImages(prev => {
        const newSet = new Set(prev);
        newSet.add(0);
        return newSet;
      });
    }
  }, [recipes.length, loadedImages]);

  return (
    <section>
      <h1 className="text-3xl md:text-5xl font-bold text-slate-800 text-center mb-4">
        Jelajahi Resep Minuman
      </h1>
      <p className="text-center text-slate-500 max-w-2xl mx-auto mb-8">
        Temukan minuman segar, hangat, dan kekinian. Mulai dari kopi hingga jus buah, semua ada di sini.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {recipes.map((recipe, index) => (
          <div 
            key={recipe.id} 
            ref={el => cardRefs.current[index] = el}
            className={`group transform transition-all duration-700 ${
              visibleCards.has(index) 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}
          >
            <div 
              onClick={() => onRecipeClick && onRecipeClick(recipe.id)}
              className="relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl shadow-green-500/5 hover:shadow-green-500/15 transition-all duration-500 cursor-pointer group-hover:scale-105 group-hover:bg-white/20">
              
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative h-32 md:h-56 overflow-hidden">
                {/* Loading placeholder */}
                {!loadedImages.has(index) && (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400 text-sm">Memuat gambar...</div>
                  </div>
                )}
                
                {/* Gambar dengan lazy loading */}
                <img 
                  ref={el => {
                    imgRefs.current[index] = el;
                  }}
                  src={loadedImages.has(index) ? recipe.image_url : ''}
                  alt={recipe.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    loadedImages.has(index) 
                      ? 'opacity-100 group-hover:scale-110' 
                      : 'opacity-0'
                  }`}
                  loading="lazy"
                  onError={(e) => {
                    // Fallback untuk gambar error
                    e.target.style.display = 'none';
                    const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                    }
                  }}
                />
                
                {/* Fallback placeholder untuk gambar error */}
                <div 
                  className="image-placeholder absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-green-100 to-green-200"
                  style={{ display: 'none' }}
                >
                  <Coffee className="w-8 h-8 text-green-400" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Favorite Button */}
                <div className="absolute top-3 right-3 z-10">
                  <FavoriteButton recipe={{ ...recipe, category: 'minuman' }} size="sm" />
                </div>
              </div>
              
              <div className="relative z-10 p-4 md:p-8">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <span className="text-xs font-semibold text-green-700 bg-green-100/90 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                    Minuman
                  </span>
                  {recipe.average_rating > 0 && (
                    <div className="flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                      <span className="text-xs md:text-sm font-semibold text-slate-700">{recipe.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 mb-3 md:mb-4 text-base md:text-xl group-hover:text-green-600 transition-colors duration-200 line-clamp-2">
                  {recipe.name}
                </h3>
                <div className="flex items-center justify-between text-xs md:text-sm text-slate-600">
                  <div className="flex items-center space-x-1 md:space-x-2 bg-white/70 px-2 md:px-3 py-1 md:py-2 rounded-full">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="font-medium">{recipe.prep_time}</span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2 bg-white/70 px-2 md:px-3 py-1 md:py-2 rounded-full">
                    <ChefHat className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="font-medium">{recipe.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {recipes.length === 0 && (
        <div className="text-center py-16">
            <p className="text-slate-500">Minuman tidak ditemukan. Coba kata kunci lain.</p>
        </div>
      )}
    </section>
  );
}