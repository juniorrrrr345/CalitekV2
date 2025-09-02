'use client';
import { useState, useEffect } from 'react';

export default function TestAPIPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Test des APIs...');
      
      const [productsRes, categoriesRes, socialRes] = await Promise.all([
        fetch('/api/products-simple', { cache: 'no-store' }),
        fetch('/api/categories-simple', { cache: 'no-store' }),
        fetch('/api/social-simple', { cache: 'no-store' })
      ]);

      console.log('📊 Statuts:', {
        products: productsRes.status,
        categories: categoriesRes.status,
        social: socialRes.status
      });

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        console.log('📦 Produits récupérés:', productsData.length);
        setProducts(productsData);
      } else {
        console.error('❌ Erreur produits:', productsRes.status);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('🏷️ Catégories récupérées:', categoriesData.length);
        setCategories(categoriesData);
      } else {
        console.error('❌ Erreur catégories:', categoriesRes.status);
      }

      if (socialRes.ok) {
        const socialData = await socialRes.json();
        console.log('🌐 Réseaux sociaux récupérés:', socialData.length);
        setSocialLinks(socialData);
      } else {
        console.error('❌ Erreur réseaux sociaux:', socialRes.status);
      }

    } catch (err) {
      console.error('❌ Erreur générale:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Test des APIs CALITEK</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Test des APIs CALITEK</h1>
      
      <button 
        onClick={loadAllData}
        className="mb-8 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
      >
        Recharger les données
      </button>

      {error && (
        <div className="bg-red-600 p-4 rounded mb-8">
          <h2 className="font-bold">Erreur :</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Produits */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">📦 Produits ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="bg-gray-800 p-4 rounded">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-gray-400">Catégorie: {product.category}</p>
              <p className="text-sm text-gray-400">Farm: {product.farm}</p>
              <div className="mt-2">
                <p className="text-xs text-green-400">Image: {product.image_url?.substring(0, 60)}...</p>
                <p className="text-xs text-blue-400">Vidéo: {product.video_url?.substring(0, 60)}...</p>
              </div>
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-32 h-20 object-cover rounded mt-2"
                  onError={(e) => {
                    console.error('❌ Erreur chargement image:', product.image_url);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => console.log('✅ Image chargée:', product.name)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Catégories */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">🏷️ Catégories ({categories.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map((category) => (
            <div key={category.id} className="bg-gray-800 p-2 rounded text-center">
              <span className="text-lg">{category.icon}</span>
              <p className="text-sm">{category.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">🌐 Réseaux sociaux ({socialLinks.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {socialLinks.map((link) => (
            <div key={link.id} className="bg-gray-800 p-2 rounded text-center">
              <span className="text-lg">{link.icon}</span>
              <p className="text-sm">{link.platform || link.name}</p>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Lien
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}