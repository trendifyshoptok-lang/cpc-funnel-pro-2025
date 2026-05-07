// @ts-nocheck
import { useEffect, useRef, useState } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export const useTouchGestures = (config: SwipeConfig) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    minSwipeDistance = 50,
    maxSwipeTime = 500
  } = config;

  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;

    // Verificar se o tempo está dentro do limite
    if (deltaTime > maxSwipeTime) {
      touchStart.current = null;
      touchEnd.current = null;
      return;
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determinar direção do swipe
    if (absX > absY) {
      // Swipe horizontal
      if (absX > minSwipeDistance) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Swipe vertical
      if (absY > minSwipeDistance) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// Hook para Pull to Refresh
interface PullToRefreshConfig {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  maxPullDistance?: number;
}

export const usePullToRefresh = (config: PullToRefreshConfig) => {
  const {
    onRefresh,
    threshold = 80,
    maxPullDistance = 150
  } = config;

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const touchStartY = useRef(0);
  const scrollableRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    const scrollable = target.closest('[data-pull-to-refresh]') as HTMLElement;
    
    if (scrollable && scrollable.scrollTop === 0) {
      scrollableRef.current = scrollable;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!scrollableRef.current || scrollableRef.current.scrollTop !== 0) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - touchStartY.current);

    if (distance > 0 && distance <= maxPullDistance) {
      setPullDistance(distance);
      setIsPulling(true);
      
      // Prevenir scroll nativo quando puxando
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
    
    scrollableRef.current = null;
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1)
  };
};

// Hook para detectar scroll infinito
interface InfiniteScrollConfig {
  onLoadMore: () => void;
  threshold?: number;
  hasMore?: boolean;
}

export const useInfiniteScroll = (config: InfiniteScrollConfig) => {
  const {
    onLoadMore,
    threshold = 200,
    hasMore = true
  } = config;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const lastElementRef = (node: HTMLElement | null) => {
    if (isLoading || !hasMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setIsLoading(true);
        onLoadMore();
        
        // Simular loading (remover quando implementar real)
        setTimeout(() => setIsLoading(false), 1000);
      }
    }, {
      rootMargin: `${threshold}px`
    });

    if (node) {
      observerRef.current.observe(node);
    }
  };

  return {
    lastElementRef,
    isLoading
  };
};

// Hook para Long Press
interface LongPressConfig {
  onLongPress: () => void;
  delay?: number;
}

export const useLongPress = (config: LongPressConfig) => {
  const {
    onLongPress,
    delay = 500
  } = config;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleTouchStart = () => {
    setIsLongPressing(false);
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(true);
      onLongPress();
    }, delay);
  };

  const handleTouchEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLongPressing(false);
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchEnd,
    isLongPressing
  };
};

// Componente de exemplo de uso
export const GesturesDemo = () => {
  const [lastGesture, setLastGesture] = useState('Nenhum');
  const [counter, setCounter] = useState(0);

  const swipeHandlers = useTouchGestures({
    onSwipeLeft: () => setLastGesture('Swipe Left ← '),
    onSwipeRight: () => setLastGesture('Swipe Right →'),
    onSwipeUp: () => setLastGesture('Swipe Up ↑'),
    onSwipeDown: () => setLastGesture('Swipe Down ↓')
  });

  const { isPulling, pullDistance, pullProgress } = usePullToRefresh({
    onRefresh: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCounter(prev => prev + 1);
      setLastGesture('Refreshed! ');
    }
  });

  const longPressHandlers = useLongPress({
    onLongPress: () => setLastGesture('Long Press! ️')
  });

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Pull to Refresh Indicator */}
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white shadow-md py-4"
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
              style={{
                opacity: pullProgress,
                transform: `scale(${pullProgress})`
              }}
            />
            <span className="text-sm font-semibold text-indigo-600">
              {pullProgress >= 1 ? 'Solte para atualizar' : 'Puxe para atualizar'}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        className="h-full overflow-y-auto p-6 pb-24"
        data-pull-to-refresh
        {...swipeHandlers}
      >
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-3xl font-black text-gray-800 mb-2">
              Touch Gestures Demo
            </h1>
            <p className="text-sm text-gray-600">
              Teste os gestos abaixo:
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-sm opacity-90 mb-2">Último Gesto:</div>
            <div className="text-3xl font-black mb-4">{lastGesture}</div>
            <div className="text-sm opacity-75">
              Refresh Counter: {counter}
            </div>
          </div>

          {/* Instructions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-2xl mb-2">←→</div>
              <div className="text-sm font-semibold text-gray-700">Swipe Horizontal</div>
              <div className="text-xs text-gray-500 mt-1">
                Deslize para esquerda ou direita
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-2xl mb-2">↑↓</div>
              <div className="text-sm font-semibold text-gray-700">Swipe Vertical</div>
              <div className="text-xs text-gray-500 mt-1">
                Deslize para cima ou baixo
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="text-2xl mb-2"></div>
              <div className="text-sm font-semibold text-gray-700">Pull to Refresh</div>
              <div className="text-xs text-gray-500 mt-1">
                Puxe do topo da tela
              </div>
            </div>

            <div 
              className="bg-white rounded-xl shadow-md p-4 active:bg-indigo-50 transition-colors"
              {...longPressHandlers}
            >
              <div className="text-2xl mb-2">️</div>
              <div className="text-sm font-semibold text-gray-700">Long Press</div>
              <div className="text-xs text-gray-500 mt-1">
                Segure por 500ms
              </div>
            </div>
          </div>

          {/* Swipe Area */}
          <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl shadow-lg p-8 text-white text-center min-h-[200px] flex items-center justify-center">
            <div>
              <div className="text-4xl mb-4"></div>
              <div className="text-xl font-bold mb-2">Área de Teste</div>
              <div className="text-sm opacity-90">
                Faça swipe nesta área para testar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};