'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function SocialPageClient() {
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Synchronisation optimisée
    const interval = setInterval(loadData, 30000); // 30 secondes - Optimisé
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [socialRes, settingsRes] = await Promise.all([
        fetch('/api/cloudflare/social-links', { cache: 'no-store' }),
        fetch('/api/cloudflare/settings', { cache: 'no-store' })
      ]);
      
      if (socialRes.ok) {
        const socialData = await socialRes.json();
        setSocialLinks(socialData || []);
      }
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData || {});
      }
    } catch (error) {
      console.error('❌ Erreur chargement social:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen loading-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="global-overlay"></div>
      <div className="content-layer">
        <Header />
        
        <main className="pt-32 pb-24 px-4 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              Nos Réseaux
            </h1>
            <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">
              Rejoignez <span className="text-yellow-400">{settings?.shop_name || 'CALITEK'}</span> sur nos réseaux sociaux
            </p>
          </div>

          {socialLinks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 border border-white/20 rounded-xl p-6 text-center hover:bg-gray-800 transition-all"
                >
                  <div className="text-3xl mb-3">{link.icon}</div>
                  <h3 className="text-white font-semibold mb-2">{link.platform || link.name}</h3>
                  <div className="w-8 h-1 bg-blue-500 mx-auto rounded-full"></div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400">Aucun réseau social configuré</p>
            </div>
          )}
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}