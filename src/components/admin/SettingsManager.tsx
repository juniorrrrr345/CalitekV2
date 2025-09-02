'use client';
import { useState, useEffect } from 'react';


interface Settings {
  shopTitle: string;
  whatsappLink: string;
  whatsappNumber: string;
  titleStyle: string;
  backgroundImage: string;
  backgroundOpacity: number;
  backgroundBlur: number;
  scrollingText: string;
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<Settings>({
    shopTitle: '',
    whatsappLink: '',
    whatsappNumber: '',
    titleStyle: 'glow',
    backgroundImage: '',
    backgroundOpacity: 20,
    backgroundBlur: 5,
    scrollingText: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cloudflare/settings');
      if (response.ok) {
        const data = await response.json();
        console.log('📝 Settings reçus depuis API:', data);
        
        setSettings({
          shopTitle: data.shop_name || data.shopTitle || '',
          whatsappLink: data.whatsapp_link || data.contact_info || data.whatsappLink || '',
          whatsappNumber: data.whatsapp_number || data.whatsappNumber || '',
          titleStyle: data.theme_color || data.titleStyle || 'glow',
          backgroundImage: data.background_image || data.backgroundImage || '',
          backgroundOpacity: data.background_opacity || data.backgroundOpacity || 20,
          backgroundBlur: data.background_blur || data.backgroundBlur || 5,
          scrollingText: data.scrolling_text || data.scrollingText || ''
        });
        
        console.log('📝 Settings mappés pour interface:', {
          whatsappLink: data.whatsapp_link || data.contact_info,
          backgroundImage: data.background_image || data.backgroundImage,
          titleStyle: data.theme_color || data.titleStyle
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // S'assurer que saving est bien à false au départ
    if (saving) {
      console.log('Sauvegarde déjà en cours, abandon');
      return;
    }

    try {
      setSaving(true);
      setMessage(''); // Effacer les anciens messages
      console.log('🔄 Tentative de sauvegarde avec:', settings);
      
      const response = await fetch('/api/cloudflare/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      console.log('📡 Réponse API:', response.status, response.statusText);
      
      if (response.ok) {
        const savedData = await response.json();
        console.log('✅ Données sauvegardées:', savedData);
        
        // Message de succès immédiat
        setMessage('✅ Paramètres sauvegardés avec succès ! Les changements sont visibles immédiatement sur la boutique');
        setTimeout(() => setMessage(''), 5000);
        
        // Sauvegarder dans localStorage pour synchronisation
        try {
          localStorage.setItem('shopSettings', JSON.stringify(settings));
          window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
        } catch (storageError) {
          console.warn('Erreur localStorage:', storageError);
        }
        
        // Recharger les données en arrière-plan (optionnel)
        setTimeout(async () => {
          try {
            const refreshResponse = await fetch('/api/cloudflare/settings');
            if (refreshResponse.ok) {
              const refreshedData = await refreshResponse.json();
              console.log('🔄 Données rechargées:', refreshedData);
            }
          } catch (error) {
            console.warn('Erreur rechargement:', error);
          }
        }, 1000);
        
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur API:', response.status, errorText);
        setMessage(`❌ Erreur lors de la sauvegarde: ${response.status} - ${response.statusText}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('❌ Erreur catch:', error);
      setMessage(`❌ Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      // S'assurer que saving revient TOUJOURS à false
      console.log('🔄 Fin sauvegarde, setSaving(false)');
      setSaving(false);
    }
  };

  const updateField = (field: keyof Settings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 max-w-full lg:max-w-7xl mx-auto">
      {/* Header avec bouton de sauvegarde - optimisé responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 sticky top-0 bg-black/95 backdrop-blur-md p-3 sm:p-4 -mx-2 sm:-mx-4 rounded-lg sm:rounded-xl border border-white/10 z-10">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">Configuration de la Boutique</h1>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-400 mt-1">
              État: {loading ? 'Chargement' : saving ? 'Sauvegarde' : 'Prêt'} | Message: {message ? 'Affiché' : 'Aucun'}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-white hover:bg-gray-100 disabled:bg-gray-600 text-black font-medium sm:font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm md:text-base transition-all"
          >
            <span>💾</span>
            <span>{saving ? 'Sauvegarde en cours...' : 'Sauvegarder'}</span>
          </button>
          
          {saving && (
            <button
              onClick={() => {
                setSaving(false);
                setMessage('');
                console.log('🔄 Reset forcé de l\'état saving');
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg text-xs sm:text-sm transition-all"
            >
              ❌ Annuler
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          message.includes('✅') 
            ? 'bg-green-900/50 border-green-400 text-green-100' 
            : 'bg-red-900/50 border-red-400 text-red-100'
        }`}>
          <p className="font-semibold text-center">{message}</p>
        </div>
      )}

      {/* Contenu scrollable avec indicateur de scroll */}
      <div className="max-h-[70vh] overflow-y-auto pr-2 pb-8 border border-white/10 rounded-lg">
        <div className="space-y-6 lg:space-y-8 p-2">
          
          {/* Debug info - visible seulement en dev */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-yellow-200 text-xs">
              <p>Debug: titleStyle = {settings.titleStyle}</p>
              <p>Debug: backgroundImage = {settings.backgroundImage || 'vide'}</p>
              <p>Debug: scrollingText = {settings.scrollingText || 'vide'}</p>
            </div>
          )}


        {/* Contact et commandes */}
        <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">📱</span>
            Contact et commandes
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lien de commande
              </label>
              <input
                type="url"
                value={settings.whatsappLink}
                onChange={(e) => updateField('whatsappLink', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="https://wa.me/33612345678 ou https://t.me/username ou https://instagram.com/username"
              />
              <p className="text-xs text-gray-400 mt-1">
                Lien vers votre méthode de contact préférée (WhatsApp, Telegram, Instagram, etc.)
              </p>
            </div>
          </div>
        </div>

        {/* Style du titre */}
        <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">🎨</span>
                            Style du titre de la boutique
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Style du titre
              </label>
              <select
                value={settings.titleStyle}
                onChange={(e) => updateField('titleStyle', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="glow">Lueur (défaut)</option>
                <option value="gradient">Dégradé coloré</option>
                <option value="neon">Effet néon</option>
                <option value="rainbow">Arc-en-ciel</option>
                <option value="shadow">Ombre portée</option>
                <option value="bounce">Animation rebond</option>
                <option value="graffiti">🎨 Graffiti Style</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Texte défilant (bannière)
              </label>
              <input
                type="text"
                value={settings.scrollingText}
                onChange={(e) => updateField('scrollingText', e.target.value)}
                className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white"
                placeholder="NOUVEAU ! Livraison express disponible..."
              />
              <p className="text-gray-500 text-xs mt-1">
                Texte qui défile de droite à gauche en haut de la page
              </p>
            </div>
          </div>
        </div>

        {/* Arrière-plan personnalisé */}
        <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">🖼️</span>
            Arrière-plan personnalisé
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image d'arrière-plan
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      const response = await fetch('/api/cloudflare/upload', {
                        method: 'POST',
                        body: formData,
                      });
                      if (response.ok) {
                        const data = await response.json();
                        updateField('backgroundImage', data.url);
                        setMessage('✅ Image téléchargée ! Cliquez sur Sauvegarder pour appliquer');
                        setTimeout(() => setMessage(''), 5000);
                      }
                    } catch (error) {
                      console.error('Erreur upload:', error);
                      setMessage('❌ Erreur lors de l\'upload');
                    }
                  }
                }}
                className="w-full bg-gray-800 border border-white/20 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-100"
              />
              {settings.backgroundImage && (
                <div className="mt-2">
                  <div className="w-32 h-20 rounded-lg border border-white/20 overflow-hidden">
                    <img
                      src={settings.backgroundImage}
                      alt="Aperçu image de fond"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => updateField('backgroundImage', '')}
                    className="ml-2 text-red-400 hover:text-red-300 text-sm"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Opacité (0-100%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.backgroundOpacity}
                  onChange={(e) => updateField('backgroundOpacity', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-400 text-sm">{settings.backgroundOpacity}%</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Flou (0-20px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={settings.backgroundBlur}
                  onChange={(e) => updateField('backgroundBlur', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-gray-400 text-sm">{settings.backgroundBlur}px</span>
              </div>
            </div>
          </div>
        </div>



        {/* Aperçu en temps réel */}
        <div className="bg-gray-900 border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="mr-2">👁️</span>
            Aperçu du header
          </h2>
          
          <div className="relative bg-black rounded-lg overflow-hidden border border-white/20">
            {/* Image de fond avec opacité et flou */}
            {settings.backgroundImage && (
              <div 
                className="absolute inset-0 w-full h-full"
                style={{
                  opacity: settings.backgroundOpacity / 100,
                  filter: `blur(${settings.backgroundBlur}px)`
                }}
              >
                <img
                  src={settings.backgroundImage}
                  alt="Arrière-plan"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Contenu par-dessus l'image */}
            <div className="relative z-10">
              {/* Bandeau */}
              <div className="bg-white text-black py-1 px-4 text-center">
                <p className="text-black text-xs font-bold tracking-wide">
                  {settings.scrollingText || 'Aperçu du bandeau'}
                </p>
              </div>
              
              {/* Logo */}
              <div className="bg-black/50 backdrop-blur-sm py-6 px-4 text-center border-b border-white/20">
                <h1 className={`text-2xl font-black text-white tracking-wider ${
                  settings.titleStyle === 'glow' ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]' :
                  settings.titleStyle === 'gradient' ? 'bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent' :
                  settings.titleStyle === 'neon' ? 'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]' :
                  settings.titleStyle === 'rainbow' ? 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse' :
                  settings.titleStyle === 'shadow' ? 'drop-shadow-[3px_3px_6px_rgba(0,0,0,0.8)]' :
                  settings.titleStyle === 'bounce' ? 'animate-bounce' :
                  settings.titleStyle === 'graffiti' ? 'text-yellow-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] transform rotate-1' :
                  ''
                }`}>
                  {settings.shopTitle || 'CALITEK'}
                </h1>
                <p className="text-gray-400 text-xs mt-1 uppercase tracking-[0.2em] font-medium">
                  Boutique Premium
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}