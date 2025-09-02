const { MongoClient } = require('mongodb');

// DONNÉES CALITEK
const MONGODB_URI = 'mongodb+srv://calitkekj:mBPviTkb8X2Wqasb@calitek.vuwxigi.mongodb.net/?retryWrites=true&w=majority&appName=calitek';
const MONGODB_DB_NAME = 'test'; // Base par défaut

const CLOUDFLARE_CONFIG = {
  accountId: '7979421604bd07b3bd34d3ed96222512',
  databaseId: 'e5ef7989-a88e-422c-9f6b-91d2d3adda12',
  apiToken: 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW'
};

async function executeSqlOnD1(sql, params = []) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  const curlCmd = `curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_CONFIG.accountId}/d1/database/${CLOUDFLARE_CONFIG.databaseId}/query" \\
    -H "Authorization: Bearer ${CLOUDFLARE_CONFIG.apiToken}" \\
    -H "Content-Type: application/json" \\
    --data '{"sql": "${sql}", "params": ${JSON.stringify(params)}}'`;
  
  try {
    const { stdout } = await execAsync(curlCmd);
    const data = JSON.parse(stdout);
    if (!data.success) {
      throw new Error(`D1 Error: ${JSON.stringify(data.errors)}`);
    }
    return data;
  } catch (error) {
    throw error;
  }
}

async function clearD1Tables() {
  console.log('🗑️ Nettoyage des tables D1...');
  
  const tables = ['products', 'categories', 'farms', 'social_links', 'settings', 'pages'];
  
  for (const table of tables) {
    try {
      await executeSqlOnD1(`DELETE FROM ${table}`);
      console.log(`✅ Table ${table} nettoyée`);
    } catch (error) {
      console.log(`⚠️ Erreur nettoyage ${table}:`, error.message);
    }
  }
}

async function migrateCalitekData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connexion MongoDB CALITEK réussie');
    
    const db = client.db(MONGODB_DB_NAME);
    
    // Nettoyer les tables D1 d'abord
    await clearD1Tables();
    
    console.log('🔄 Migration COMPLÈTE depuis MongoDB CALITEK...');
    
    // Migration categories UNIQUES
    console.log('📁 Migration catégories...');
    const mongoCategories = await db.collection('categories').find({}).toArray();
    console.log(`Trouvé ${mongoCategories.length} catégories dans MongoDB`);
    
    const uniqueCategories = [...new Map(mongoCategories.map(cat => [cat.name, cat])).values()];
    
    for (const cat of uniqueCategories) {
      await executeSqlOnD1(
        'INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)',
        [
          String(cat.name || ''), 
          String(cat.emoji || cat.icon || '📦'), 
          String(cat.color || '#22C55E')
        ]
      );
    }
    console.log(`✅ ${uniqueCategories.length} catégories uniques migrées`);
    
    // Migration farms UNIQUES
    console.log('🏪 Migration farms...');
    const mongoFarms = await db.collection('farms').find({}).toArray();
    console.log(`Trouvé ${mongoFarms.length} farms dans MongoDB`);
    
    const uniqueFarms = [...new Map(mongoFarms.map(farm => [farm.name, farm])).values()];
    
    for (const farm of uniqueFarms) {
      await executeSqlOnD1(
        'INSERT INTO farms (name, description, location, contact) VALUES (?, ?, ?, ?)',
        [
          farm.name || 'Farm', 
          farm.description || 'Production CALITEK', 
          farm.location || farm.country || 'Local', 
          farm.contact || 'contact@calitek.com'
        ]
      );
    }
    console.log(`✅ ${uniqueFarms.length} farms uniques migrées`);
    
    // Migration social_links UNIQUES
    console.log('📱 Migration liens sociaux...');
    const mongoSocial = await db.collection('socialLinks').find({}).toArray();
    console.log(`Trouvé ${mongoSocial.length} liens sociaux dans MongoDB`);
    
    const uniqueSocial = [...new Map(mongoSocial.map(link => [link.name || link.platform, link])).values()];
    
    for (const link of uniqueSocial) {
      await executeSqlOnD1(
        'INSERT INTO social_links (platform, url, icon, is_available) VALUES (?, ?, ?, ?)',
        [
          link.name || link.platform || 'Platform', 
          link.url || '#', 
          link.icon || '📱', 
          1
        ]
      );
    }
    console.log(`✅ ${uniqueSocial.length} liens sociaux uniques migrés`);
    
    // Migration products UNIQUES avec conversion noms → IDs
    console.log('🛍️ Migration produits...');
    const mongoProducts = await db.collection('products').find({}).toArray();
    console.log(`Trouvé ${mongoProducts.length} produits dans MongoDB`);
    
    const uniqueProducts = [...new Map(mongoProducts.map(prod => [prod.name, prod])).values()];
    
    for (const product of uniqueProducts) {
      // Trouver les IDs des catégories et farms
      let category_id = null;
      let farm_id = null;
      
      if (product.category) {
        const catResult = await executeSqlOnD1('SELECT id FROM categories WHERE name = ?', [product.category]);
        category_id = catResult.result?.[0]?.results?.[0]?.id || null;
      }
      
      if (product.farm) {
        const farmResult = await executeSqlOnD1('SELECT id FROM farms WHERE name = ?', [product.farm]);
        farm_id = farmResult.result?.[0]?.results?.[0]?.id || null;
      }
      
      await executeSqlOnD1(
        'INSERT INTO products (name, description, category_id, farm_id, image_url, video_url, price, stock, prices, features, tags, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          product.name || 'Produit',
          product.description || 'Produit CALITEK de qualité',
          category_id,
          farm_id,
          product.image || product.image_url || '',
          product.video || product.video_url || '',
          Number(product.price || 0),
          Number(product.stock || 10),
          JSON.stringify(product.prices || {}),
          product.features || '',
          product.tags || '',
          1
        ]
      );
    }
    console.log(`✅ ${uniqueProducts.length} produits uniques migrés`);
    
    // Migration pages si elles existent
    console.log('📄 Migration pages...');
    try {
      const mongoPages = await db.collection('pages').find({}).toArray();
      console.log(`Trouvé ${mongoPages.length} pages dans MongoDB`);
      
      for (const page of mongoPages) {
        await executeSqlOnD1(
          'INSERT INTO pages (slug, title, content, is_active) VALUES (?, ?, ?, ?)',
          [
            page.slug || page.title?.toLowerCase().replace(/\s+/g, '-') || 'page',
            page.title || 'Page',
            page.content || '',
            page.is_active !== false ? 1 : 0
          ]
        );
      }
      console.log(`✅ ${mongoPages.length} pages migrées`);
    } catch (error) {
      console.log('⚠️ Pas de collection pages trouvée');
    }
    
    // Migration settings
    console.log('⚙️ Configuration settings...');
    await executeSqlOnD1(
      'INSERT INTO settings (id, shop_title, theme_color, background_opacity, background_blur) VALUES (?, ?, ?, ?, ?)',
      [1, 'CALITEK', 'glow', 20, 5]
    );
    console.log('✅ Settings CALITEK configurés');
    
    console.log('\n🎉 Migration MongoDB → D1 CALITEK TERMINÉE !');
    
    // Afficher résumé
    const categoriesCount = await executeSqlOnD1('SELECT COUNT(*) as count FROM categories');
    const farmsCount = await executeSqlOnD1('SELECT COUNT(*) as count FROM farms');
    const productsCount = await executeSqlOnD1('SELECT COUNT(*) as count FROM products');
    const socialCount = await executeSqlOnD1('SELECT COUNT(*) as count FROM social_links');
    
    console.log('\n📊 RÉSUMÉ FINAL :');
    console.log(`📁 Catégories : ${categoriesCount.result?.[0]?.results?.[0]?.count || 0}`);
    console.log(`🏪 Farms : ${farmsCount.result?.[0]?.results?.[0]?.count || 0}`);
    console.log(`🛍️ Produits : ${productsCount.result?.[0]?.results?.[0]?.count || 0}`);
    console.log(`📱 Liens sociaux : ${socialCount.result?.[0]?.results?.[0]?.count || 0}`);
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
  } finally {
    await client.close();
  }
}

migrateCalitekData();