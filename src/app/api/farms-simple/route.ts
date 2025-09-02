import { NextResponse } from 'next/server';

async function executeSqlOnD1(sql: string, params: any[] = []) {
  const ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
  const DATABASE_ID = '19ee81cc-91c0-4cfc-8cbe-dc67d8675e37';
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
    const data = await executeSqlOnD1('SELECT id, name, description, location, contact, created_at FROM farms ORDER BY name ASC');
    
    if (data.success && data.result?.[0]?.results) {
      return NextResponse.json(data.result[0].results);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API farms:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, location, contact } = await request.json();
    
    const data = await executeSqlOnD1(
      'INSERT INTO farms (name, description, location, contact, created_at) VALUES (?, ?, ?, ?, datetime("now")) RETURNING *',
      [name, description || 'Farm CALITEK', location || 'Non spécifié', contact || 'contact@oglegacy.com']
    );
    
    if (data.success && data.result?.[0]?.results?.[0]) {
      return NextResponse.json(data.result[0].results[0]);
    } else {
      throw new Error('Échec création farm');
    }
  } catch (error) {
    console.error('❌ Erreur création farm:', error);
    return NextResponse.json({ error: 'Erreur création farm' }, { status: 500 });
  }
}