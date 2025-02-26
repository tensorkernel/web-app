// GamePage.tsx
import React, {
  useEffect,
  useState,
  useRef,
  Suspense,
  lazy,
  Component,
  ReactNode,
  forwardRef,
} from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { supabase } from '../lib/supabase';
import type { Game } from '../types';

/* ------------------- Error Boundary Component ------------------- */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
    // Optionally log error to an external service here.
  }
  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="text-center text-white p-4 bg-red-600">
          <h1 className="text-2xl font-bold">Oops! Something went wrong.</h1>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ------------------- Social Sharing Component ------------------- */
interface SocialShareProps {
  url: string;
  title: string;
  description: string;
  image: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description,
  image,
}) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return (
    <div className="social-share my-4 flex justify-center space-x-4">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="text-blue-600"
      >
        FB
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className="text-blue-400"
      >
        TW
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share via Email"
        className="text-gray-600"
      >
        Email
      </a>
    </div>
  );
};

/* ------------------- Recommendations Component ------------------- */
interface Recommendation {
  slug: string;
  title: string;
}

interface RecommendationsProps {
  currentGameSlug: string;
}

const Recommendations: React.FC<RecommendationsProps> = ({
  currentGameSlug,
}) => {
  const dummyRecommendations: Recommendation[] = [
    { slug: 'game-1', title: 'Awesome Game 1' },
    { slug: 'game-2', title: 'Cool Game 2' },
    { slug: 'game-3', title: 'Fun Game 3' },
  ];
  return (
    <div className="recommendations mt-8 p-4 bg-gray-700 rounded">
      <h2 className="text-xl text-white mb-4">Recommended Games</h2>
      <ul className="space-y-2">
        {dummyRecommendations
          .filter((game) => game.slug !== currentGameSlug)
          .map((game) => (
            <li key={game.slug}>
              <a
                href={`/game/${game.slug}`}
                className="text-indigo-300 hover:text-indigo-500"
              >
                {game.title}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );
};

/* ------------------- Inline Game Iframe Component ------------------- */
// Using forwardRef for compatibility with Suspense
const InlineGameIframe = forwardRef<HTMLIFrameElement, React.HTMLProps<HTMLIFrameElement>>(
  (props, ref) => {
    return <iframe ref={ref} {...props} />;
  }
);

/* ------------------- Main GamePage Component ------------------- */
export function GamePage() {
  const { slug } = useParams<{ slug: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Analytics stub – replace with your own implementation.
  const trackEvent = (event: string, data?: any) => {
    console.log('Analytics Event:', event, data);
  };

  useEffect(() => {
    async function fetchGame() {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('slug', slug)
          .single();
        if (error) throw error;
        setGame(data);
        trackEvent('GameLoaded', { slug });
      } catch (err: any) {
        console.error('Error fetching game:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      fetchGame();
    }
  }, [slug]);

  // Toggle fullscreen and track events.
  const toggleFullScreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          trackEvent('EnterFullscreen', { slug });
        })
        .catch((err) => {
          console.error('Error enabling full-screen mode:', err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          trackEvent('ExitFullscreen', { slug });
        })
        .catch((err) => {
          console.error('Error disabling full-screen mode:', err);
        });
    }
  };

  // Keyboard support: ESC exits fullscreen.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        toggleFullScreen();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Attempt to remove common ad elements from the iframe (if same-origin).
  const handleIframeLoad = () => {
    if (iframeRef.current) {
      try {
        const iframeDoc =
          iframeRef.current.contentDocument ||
          iframeRef.current.contentWindow?.document;
        if (iframeDoc) {
          const adSelectors = [
            '.ad-container',
            '[id^="ad-"]',
            'iframe[src*="ads"]',
            '.advertisement',
            '.adsbygoogle',
          ];
          adSelectors.forEach((selector) => {
            const ads = iframeDoc.querySelectorAll(selector);
            ads.forEach((ad) => ad.remove());
          });
        }
      } catch (error) {
        console.warn(
          'Unable to access iframe content for ad removal. Cross-origin restrictions may apply.',
          error
        );
      }
    }
  };

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game?.title || 'Game',
    description: game?.description || '',
    image: game?.thumbnail || '',
    url: window.location.href,
    genre: game?.category || '',
    datePublished: game?.publishedDate || '2025-01-01',
    publisher: {
      '@type': 'Organization',
      name: 'Your Publisher Name',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: game?.rating || '4.5',
      ratingCount: game?.ratingCount || '1000',
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold">Game not found</h1>
        <p>{error?.message || 'There was an error loading the game.'}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Helmet>
        <title>{game.title} | Your Game Platform</title>
        <meta name="description" content={game.description} />
        <meta property="og:title" content={game.title} />
        <meta property="og:description" content={game.description} />
        <meta property="og:image" content={game.thumbnail} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        {/* PWA meta and manifest */}
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto p-4"
      >
        <div
          ref={containerRef}
          className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl relative"
        >
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullScreen}
            className="absolute top-4 right-4 z-10 p-2 bg-gray-700 rounded-full hover:bg-gray-600 focus:outline-none"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 10V7a2 2 0 012-2h3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 14v3a2 2 0 01-2 2h-3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 14v3a2 2 0 002 2h3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 10V7a2 2 0 00-2-2h-3"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 3H5a2 2 0 00-2 2v3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 3h3a2 2 0 012 2v3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 21H5a2 2 0 01-2-2v-3"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 21h3a2 2 0 002-2v-3"
                />
              </svg>
            )}
          </button>

          {/* Game iframe with lazy loading */}
          <div className="aspect-[16/9] relative">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <InlineGameIframe
                ref={iframeRef}
                src={game.iframe_url}
                title={game.title}
                className="absolute inset-0 w-full h-full"
                allow="fullscreen; autoplay; encrypted-media"
                allowFullScreen
                onLoad={handleIframeLoad}
                sandbox="allow-scripts allow-same-origin allow-fullscreen"
              />
            </Suspense>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">{game.title}</h1>
            <p className="text-gray-300 mb-6">{game.description}</p>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm">
                {game.category}
              </span>
            </div>
          </div>
        </div>

        {/* Social Sharing */}
        <SocialShare
          url={window.location.href}
          title={game.title}
          description={game.description}
          image={game.thumbnail}
        />

        {/* Recommendations */}
        <Recommendations currentGameSlug={slug} />
      </motion.div>
    </ErrorBoundary>
  );
}
