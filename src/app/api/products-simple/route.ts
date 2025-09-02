import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Utiliser les valeurs hardcodées pour éviter les problèmes d'env
    const ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
    const DATABASE_ID = 'e5ef7989-a88e-422c-9f6b-91d2d3adda12';
    const API_TOKEN = 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW';
    
    const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `
          SELECT 
            p.id, p.name, p.description, p.price, p.prices, 
            p.image_url, p.video_url, p.stock, p.is_available,
            c.name as category_name, f.name as farm_name,
            p.category_id, p.farm_id, p.features, p.tags
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN farms f ON p.farm_id = f.id
          WHERE (p.is_available = 1 OR p.is_available = 'true' OR p.is_available IS NULL)
          ORDER BY p.created_at DESC
        `
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.success && data.result?.[0]?.results) {
      const products = data.result[0].results.map((product: any) => {
        let prices = {};
        let features = [];
        let tags = [];
        
        try {
          prices = JSON.parse(product.prices || '{}');
          features = JSON.parse(product.features || '[]');
          tags = JSON.parse(product.tags || '[]');
        } catch (e) {
          prices = {};
          features = [];
          tags = [];
        }
        
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          category: product.category_name || 'Sans catégorie',
          farm: product.farm_name || 'Sans farm',
          category_id: product.category_id,
          farm_id: product.farm_id,
          image_url: product.image_url || '',
          video_url: product.video_url || '',
          prices: prices,
          price: product.price || 0,
          stock: product.stock || 0,
          is_available: product.is_available !== false,
          features: features,
          tags: tags
        };
      });
      
      return NextResponse.json(products);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API produits:', error);
    return NextResponse.json([], { status: 500 });
  }
}