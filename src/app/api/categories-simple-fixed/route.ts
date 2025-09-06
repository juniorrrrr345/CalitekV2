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
        sql: 'SELECT id, name, icon, color, created_at FROM categories ORDER BY id ASC'
      })
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
    
    if (data.success && data.result?.[0]?.results) {
      return NextResponse.json(data.result[0].results);
    } else {
      console.log('No results found, returning empty array');
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API catégories (fixed):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}