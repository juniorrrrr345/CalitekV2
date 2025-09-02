import { NextResponse } from 'next/server';
import d1Simple from '@/lib/d1-simple';

export async function GET() {
  try {
    console.log('🔍 Debug complet du système...');
    
    // Récupérer toutes les données avec le client simple
    const [products, categories, farms, socialLinks, settings, pages] = await Promise.all([
      d1Simple.getProducts(),
      d1Simple.getCategories(), 
      d1Simple.getFarms(),
      d1Simple.getSocialLinks(),
      d1Simple.getSettings(),
      Promise.all([
        d1Simple.getPage('info'),
        d1Simple.getPage('contact')
      ])
    ]);
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      database_id: 'e5ef7989-a88e-422c-9f6b-91d2d3adda12',
      counts: {
        products: products.length,
        categories: categories.length,
        farms: farms.length,
        social_links: socialLinks.length,
        pages: pages.filter(p => p).length
      },
      sample_data: {
        products: products.slice(0, 3).map(p => ({ id: p.id, name: p.name, category: p.category, farm: p.farm })),
        categories: categories.slice(0, 5).map(c => ({ id: c.id, name: c.name, icon: c.icon })),
        farms: farms.slice(0, 5).map(f => ({ id: f.id, name: f.name })),
        social_links: socialLinks.map(s => ({ id: s.id, name: s.name, url: s.url.substring(0, 30) + '...' })),
        settings: settings ? { shop_name: settings.shop_name, background_image: settings.background_image } : null,
        pages: pages.filter(p => p).map(p => ({ slug: p.slug, title: p.title, content_length: p.content?.length || 0 }))
      }
    };
    
    console.log('📊 Debug info:', debugInfo);
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('❌ Erreur debug:', error);
    return NextResponse.json({ 
      error: error.message, 
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}