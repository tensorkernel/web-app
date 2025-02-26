import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TowerControl as GameController, Github, Twitter, Mail, ChevronDown, ArrowUp, Moon, Sun } from 'lucide-react';

export function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [isMobile, setIsMobile] = useState(false);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleSection = (section) => setOpenSection(openSection === section ? null : section);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const BackToTop = () => (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 p-3 bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition-all animate-bounce"
    >
      <ArrowUp className="w-6 h-6 text-white" />
    </button>
  );

  const SectionHeader = ({ title, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex justify-between items-center w-full md:hidden"
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ChevronDown className={`w-5 h-5 text-white transition-transform ${openSection === section ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} relative`}>
      {/* Decorative SVG Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 Q50,100 100,0" fill={theme === 'dark' ? '#4F46E5' : '#818CF8'} />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <GameController className="w-8 h-8 text-indigo-500 group-hover:rotate-12 transition-transform" />
              <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                GamePortal
              </span>
            </Link>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Your ultimate destination for online gaming entertainment.
              Play the best games instantly in your browser.
            </p>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-opacity-20 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>

          {/* Quick Links - Collapsible */}
          <div className="space-y-4">
            <SectionHeader title="Quick Links" section="links" />
            <div className={`${isMobile && openSection !== 'links' ? 'hidden' : 'block'}`}>
              <ul className="space-y-3">
                {['Home', 'Top Games', 'New Releases', 'Contact Us', 'Privacy Policy', 'About Us'].map((link) => (
                  <li key={link}>
                    <Link
                      to={`/${link.toLowerCase().replace(' ', '-')}`}
                      className={`inline-block w-full py-1.5 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-all hover:pl-2 hover:border-l-4 hover:border-indigo-500`}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Categories - Collapsible */}
          <div className="space-y-4">
            <SectionHeader title="Categories" section="categories" />
            <div className={`${isMobile && openSection !== 'categories' ? 'hidden' : 'block'}`}>
              <ul className="space-y-3">
                {['Action', 'Adventure', 'Puzzle', 'Racing'].map((category) => (
                  <li key={category}>
                    <Link
                      to={`/category/${category.toLowerCase()}`}
                      className={`flex items-center group ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Connect Section - Collapsible */}
          <div className="space-y-6">
            <SectionHeader title="Connect" section="connect" />
            <div className={`${isMobile && openSection !== 'connect' ? 'hidden' : 'block'}`}>
              <div className="flex space-x-4">
                {[
                  { icon: Github, url: 'https://github.com' },
                  { icon: Twitter, url: 'https://twitter.com' },
                  { icon: Mail, url: 'mailto:contact@gameportal.com' }
                ].map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-all hover:scale-110`}
                  >
                    <social.icon className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                  </a>
                ))}
              </div>
              <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Stay updated with our latest games and features.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className={`mt-8 pt-8 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>© {new Date().getFullYear()} GamePortal. All rights reserved.</p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
