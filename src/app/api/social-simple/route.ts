import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
    const data = await executeSqlOnD1('SELECT id, platform as name, url, icon, is_available, created_at FROM social_links WHERE (is_available = 1 OR is_available = "true" OR is_available IS NULL) ORDER BY created_at ASC');
    
    if (data.success && data.result?.[0]?.results) {
      return NextResponse.json(data.result[0].results);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API réseaux sociaux:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { platform, url, icon, is_available } = await request.json();
    
    const data = await executeSqlOnD1(
      'INSERT INTO social_links (platform, url, icon, is_available, created_at) VALUES (?, ?, ?, ?, datetime("now")) RETURNING *',
      [platform, url, icon || '📱', is_available !== undefined ? is_available : 1]
    );
    
    if (data.success && data.result?.[0]?.results?.[0]) {
      return NextResponse.json(data.result[0].results[0]);
    } else {
      throw new Error('Échec création social link');
    }
  } catch (error) {
    console.error('❌ Erreur création social link:', error);
    return NextResponse.json({ error: 'Erreur création social link' }, { status: 500 });
  }
}