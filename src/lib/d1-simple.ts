// Client D1 simple qui fonctionne VRAIMENT avec les données

const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: 'e5ef7989-a88e-422c-9f6b-91d2d3adda12',
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW'
};

export async function executeD1Query(sql: string, params: any[] = []) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_CONFIG.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql, params })
  });
  
  if (!response.ok) {
    throw new Error(`D1 Error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

// Fonctions simples qui FONCTIONNENT
export const d1Simple = {
  // Récupérer tous les produits
  async getProducts() {
    const result = await executeD1Query(`
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
    
    return result.result?.[0]?.results || [];
  },

  // Récupérer toutes les catégories
  async getCategories() {
    const result = await executeD1Query('SELECT * FROM categories ORDER BY id ASC');
    return result.result?.[0]?.results || [];
  },

  // Récupérer toutes les farms
  async getFarms() {
    const result = await executeD1Query('SELECT * FROM farms ORDER BY id ASC');
    return result.result?.[0]?.results || [];
  },

  // Récupérer tous les réseaux sociaux
  async getSocialLinks() {
    const result = await executeD1Query('SELECT * FROM social_links ORDER BY created_at ASC');
    return result.result?.[0]?.results || [];
  },

  // Récupérer une page par slug
  async getPage(slug: string) {
    const result = await executeD1Query('SELECT * FROM pages WHERE slug = ? LIMIT 1', [slug]);
    return result.result?.[0]?.results?.[0] || null;
  },

  // Récupérer les settings
  async getSettings() {
    const result = await executeD1Query('SELECT * FROM settings WHERE id = 1 LIMIT 1');
    return result.result?.[0]?.results?.[0] || null;
  }
};

export default d1Simple;