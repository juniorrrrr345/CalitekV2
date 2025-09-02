import { NextRequest, NextResponse } from 'next/server';

async function executeSqlOnD1(sql: string, params: any[] = []) {
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
    body: JSON.stringify({ sql, params })
  });
  
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
  const data = await response.json();
  return data;
}

// GET - Récupérer tous les produits pour le panel admin
export async function GET(request: NextRequest) {
  try {
    const data = await executeSqlOnD1(`
      SELECT 
        p.id, p.name, p.description, p.price, p.prices, 
        p.image_url, p.video_url, p.stock, p.is_available,
        c.name as category, f.name as farm,
        p.category_id, p.farm_id, p.features, p.tags
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN farms f ON p.farm_id = f.id
      ORDER BY p.created_at DESC
    `);
    
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
          _id: product.id, // Frontend s'attend à _id
          id: product.id,
          name: product.name,
          description: product.description || '',
          category: product.category || 'Sans catégorie',
          farm: product.farm || 'Sans farm',
          category_id: product.category_id,
          farm_id: product.farm_id,
          image_url: product.image_url || '',
          video_url: product.video_url || '',
          prices: prices,
          price: product.price || 0,
          stock: product.stock || 0,
          is_available: product.is_available !== false && product.is_available !== 'false',
          features: features,
          tags: tags
        };
      });
      
      console.log(`🛍️ Produits récupérés pour admin: ${products.length}`);
      return NextResponse.json(products);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API produits admin:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
    const DATABASE_ID = 'e5ef7989-a88e-422c-9f6b-91d2d3adda12';
    const API_TOKEN = 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW';
    
    const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
    
    // Convertir category et farm en IDs si nécessaire
    let category_id = body.category_id;
    let farm_id = body.farm_id;
    
    // Si on reçoit des noms au lieu d'IDs, les convertir
    if (body.category && !category_id) {
      const catData = await executeSqlOnD1('SELECT id FROM categories WHERE name = ?', [body.category]);
      if (catData.success && catData.result?.[0]?.results?.[0]) {
        category_id = catData.result[0].results[0].id;
      }
    }
    
    if (body.farm && !farm_id) {
      const farmData = await executeSqlOnD1('SELECT id FROM farms WHERE name = ?', [body.farm]);
      if (farmData.success && farmData.result?.[0]?.results?.[0]) {
        farm_id = farmData.result[0].results[0].id;
      }
    }
    
    const sql = `INSERT INTO products (
      name, description, price, prices, category_id, farm_id,
      image_url, video_url, stock, is_available, features, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
      body.name,
      body.description || '',
      parseFloat(body.price) || 0,
      JSON.stringify(body.prices || {}),
      category_id || null,
      farm_id || null,
      body.image_url || '',
      body.video_url || '',
      parseInt(body.stock) || 0,
      body.is_available !== false,
      JSON.stringify(body.features || []),
      JSON.stringify(body.tags || [])
    ];
    
    const data = await executeSqlOnD1(sql, values);
    
    if (data.success) {
      console.log('✅ Produit créé avec succès');
      
      // Récupérer le produit créé avec ses relations
      const newId = data.result[0].meta.last_row_id;
      const result = await executeSqlOnD1(`
        SELECT 
          p.*, 
          c.name as category, 
          f.name as farm
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN farms f ON p.farm_id = f.id
        WHERE p.id = ?
      `, [newId]);
      
      if (result.success && result.result?.[0]?.results?.[0]) {
        const product = result.result[0].results[0];
        return NextResponse.json({
          ...product,
          prices: JSON.parse(product.prices || '{}'),
          features: JSON.parse(product.features || '[]'),
          tags: JSON.parse(product.tags || '[]')
        }, { status: 201 });
      } else {
        return NextResponse.json({ success: true, id: newId }, { status: 201 });
      }
    } else {
      throw new Error('Erreur création produit');
    }
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}