'use client';
import { useState } from 'react';
import ProductsManager from './ProductsManager';
import CategoriesManager from './CategoriesManager';
import FarmsManager from './FarmsManager';
import SocialLinksManager from './SocialLinksManager';
import SettingsManager from './SettingsManager';
import PagesManager from './PagesManager';


interface AdminDashboardProps {
  onLogout: () => void;
}

type SectionType = 'products' | 'categories' | 'farms' | 'settings' | 'pages' | 'social';

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<SectionType>('products');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'products' as SectionType, label: 'Produits', icon: '🛍️' },
    { id: 'categories' as SectionType, label: 'Catégories', icon: '🏷️' },
    { id: 'farms' as SectionType, label: 'Farms', icon: '🏭' },
    { id: 'settings' as SectionType, label: 'Configuration', icon: '⚙️' },
    { id: 'pages' as SectionType, label: 'Pages', icon: '📄' },
    { id: 'social' as SectionType, label: 'Réseaux sociaux', icon: '🌐' },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'products':
        return <ProductsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'farms':
        return <FarmsManager />;
      case 'settings':
        return <SettingsManager />;
      case 'pages':
        return <PagesManager />;
      case 'social':
        return <SocialLinksManager />;
      default:
        return <ProductsManager />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop: Sidebar + Content */}
      <div className="hidden lg:flex">
        {/* Sidebar Desktop avec style ÎLE DE FRANCE FULL OPTION */}
        <aside className="w-72 bg-black/90 backdrop-blur-sm border-r border-white/20 min-h-screen fixed left-0 top-0 z-50">
          <div className="p-6 border-b border-white/20">
            <h1 className="text-2xl font-black text-white tracking-wider">CALITEK</h1>
            <p className="text-gray-400 text-xs mt-1 uppercase tracking-[0.2em] font-medium">Panel Admin - CALITEK</p>
          </div>
          <nav className="p-4">
            <div className="space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4 shadow-lg hover:scale-[1.02] ${
                    activeSection === item.id
                      ? 'bg-white/10 border border-white/20 text-white font-medium backdrop-blur-sm shadow-xl'
                      : 'bg-gray-900/50 border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/20">
              <button
                onClick={onLogout}
                className="w-full text-left p-4 rounded-xl text-red-400 bg-red-900/10 border border-red-400/20 hover:bg-red-900/20 hover:text-red-300 transition-all duration-300 flex items-center gap-4 shadow-lg hover:scale-[1.02]"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Content Desktop */}
        <main className="flex-1 ml-72">
          <div className="p-6 min-h-screen">
            {renderActiveSection()}
          </div>
        </main>
      </div>

      {/* Mobile & Tablet: Interface adaptée */}
      <div className="lg:hidden">
        {/* Mobile: Sidebar coulissante */}
        <div className="sm:hidden">
          {/* Header Mobile avec menu hamburger */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/20">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-lg font-black text-white tracking-wider">CALITEK</h1>
                <p className="text-gray-400 text-xs uppercase tracking-[0.2em] font-medium">Panel Admin - CALITEK</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-white/10 border border-white/20 text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </header>

          {/* Sidebar coulissante Mobile */}
          <aside className={`fixed top-0 left-0 z-40 w-80 h-screen bg-black/95 backdrop-blur-sm border-r border-white/20 transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="p-4 pt-20 border-b border-white/20">
              <h2 className="text-lg font-bold text-white mb-2">Navigation</h2>
            </div>
            <nav className="p-4">
              <div className="space-y-3">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-4 shadow-lg ${
                      activeSection === item.id
                        ? 'bg-white/20 border border-white/30 text-white font-medium backdrop-blur-sm shadow-xl scale-105'
                        : 'bg-gray-900/50 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/20">
                <button
                  onClick={onLogout}
                  className="w-full text-left p-4 rounded-xl text-red-400 bg-red-900/20 border border-red-400/30 hover:bg-red-900/30 hover:text-red-300 transition-all duration-300 flex items-center gap-4 shadow-lg"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Overlay pour fermer le menu */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 z-30 bg-black/50" 
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Contenu Mobile */}
          <main className="pt-20 min-h-screen">
            <div className="p-3">
              {renderActiveSection()}
            </div>
          </main>
        </div>

        {/* Tablette: Sidebar fixe mais plus petite */}
        <div className="hidden sm:flex lg:hidden h-screen">
          <aside className="w-64 bg-black/90 backdrop-blur-sm border-r border-white/20 min-h-screen overflow-y-auto">
            <div className="p-4 border-b border-white/20">
              <h1 className="text-lg font-black text-white tracking-wider">CALITEK</h1>
              <p className="text-gray-400 text-xs mt-1 uppercase tracking-[0.2em] font-medium">Panel Admin - CALITEK</p>
            </div>
            <nav className="p-3">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:scale-[1.02] text-sm ${
                      activeSection === item.id
                        ? 'bg-white/10 border border-white/20 text-white font-medium backdrop-blur-sm shadow-xl'
                        : 'bg-gray-900/50 border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/20">
                <button
                  onClick={onLogout}
                  className="w-full text-left p-3 rounded-xl text-red-400 bg-red-900/10 border border-red-400/20 hover:bg-red-900/20 hover:text-red-300 transition-all duration-300 flex items-center gap-3 shadow-lg hover:scale-[1.02] text-sm"
                >
                  <span className="text-lg">🚪</span>
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Contenu Tablette */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 min-h-screen">
              {renderActiveSection()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}