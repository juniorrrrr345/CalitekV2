import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CachePreloader from '@/components/CachePreloader'
import GlobalBackgroundProvider from '@/components/GlobalBackgroundProvider'
import Cart from '@/components/Cart'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CALITEK - Boutique en ligne',
  description: 'CALITEK - Votre boutique en ligne. Produits de qualité et livraison rapide.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CALITEK'
  },
  formatDetection: {
    telephone: false
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Background par défaut pour éviter l'écran noir */
              html, body {
                background-color: #1a1a1a !important;
                background-image: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
                min-height: 100vh;
              }
              .main-container {
                min-height: 100vh;
                background-color: transparent;
              }
              .global-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                z-index: 1;
              }
              .content-layer {
                position: relative;
                z-index: 2;
                min-height: 100vh;
              }
            `
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Appliquer le background immédiatement depuis localStorage OU API
              (function() {
                function applyBackground(backgroundImage, backgroundOpacity = 20, backgroundBlur = 5) {
                  const style = document.createElement('style');
                  style.id = 'instant-background-style';
                  style.textContent = \`
                    html, body, .main-container, .min-h-screen {
                      background-image: url(\${backgroundImage}) !important;
                      background-size: cover !important;
                      background-position: center !important;
                      background-repeat: no-repeat !important;
                      background-attachment: fixed !important;
                      background-color: black !important;
                    }
                    .global-overlay {
                      background-color: rgba(0, 0, 0, \${backgroundOpacity / 100}) !important;
                      backdrop-filter: blur(\${backgroundBlur}px) !important;
                      -webkit-backdrop-filter: blur(\${backgroundBlur}px) !important;
                    }
                    /* Appliquer aussi sur les pages de chargement */
                    .loading-container, .loading-screen {
                      background-image: url(\${backgroundImage}) !important;
                      background-size: cover !important;
                      background-position: center !important;
                    }
                  \`;
                  
                  // Supprimer l'ancien style s'il existe
                  const oldStyle = document.getElementById('instant-background-style');
                  if (oldStyle) oldStyle.remove();
                  
                  document.head.appendChild(style);
                }
                
                try {
                  // 1. Essayer depuis localStorage d'abord
                  const settings = localStorage.getItem('shopSettings');
                  if (settings) {
                    const parsed = JSON.parse(settings);
                    if (parsed.backgroundImage || parsed.background_image) {
                      applyBackground(
                        parsed.backgroundImage || parsed.background_image,
                        parsed.backgroundOpacity || parsed.background_opacity || 20,
                        parsed.backgroundBlur || parsed.background_blur || 5
                      );
                      return; // Arrêter ici si on a trouvé dans localStorage
                    }
                  }
                  
                  // 2. Si pas dans localStorage, charger depuis l'API
                  fetch('/api/cloudflare/settings', { cache: 'no-store' })
                    .then(response => response.json())
                    .then(apiSettings => {
                      if (apiSettings && (apiSettings.backgroundImage || apiSettings.background_image)) {
                        // Sauvegarder dans localStorage
                        localStorage.setItem('shopSettings', JSON.stringify(apiSettings));
                        
                        // Appliquer immédiatement
                        applyBackground(
                          apiSettings.backgroundImage || apiSettings.background_image,
                          apiSettings.backgroundOpacity || apiSettings.background_opacity || 20,
                          apiSettings.backgroundBlur || apiSettings.background_blur || 5
                        );
                        
                        // Mettre à jour aussi le logo de chargement (div avec background)
                        const logoElements = document.querySelectorAll('[style*="backgroundImage"]');
                        logoElements.forEach(logo => {
                          const newBg = \`url(\${apiSettings.backgroundImage || apiSettings.background_image})\`;
                          if (!logo.style.backgroundImage.includes(apiSettings.backgroundImage || apiSettings.background_image)) {
                            logo.style.backgroundImage = newBg;
                            console.log('🎨 Logo chargement mis à jour via background');
                          }
                        });
                      }
                    })
                    .catch(e => console.error('Erreur chargement fond API:', e));
                  
                  // Fond noir par défaut en attendant
                  document.documentElement.style.backgroundColor = 'black';
                  document.body.style.backgroundColor = 'black';
                } catch (e) {
                  console.error('Erreur fond d\\'image:', e);
                }
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning style={{ backgroundColor: 'black' }}>
        <GlobalBackgroundProvider />
        <CachePreloader />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
        <Cart />
        {children}
      </body>
    </html>
  )
}