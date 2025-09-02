import { NextRequest, NextResponse } from 'next/server';

// GET - Récupérer toutes les farms pour le panel admin
export async function GET() {
  try {
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
        sql: 'SELECT * FROM farms ORDER BY name ASC'
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.success && data.result?.[0]?.results) {
      const farms = data.result[0].results.map((farm: any) => ({
        ...farm,
        _id: farm.id // Frontend s'attend à _id
      }));
      console.log(`🏭 Farms récupérées pour admin: ${farms.length}`);
      return NextResponse.json(farms);
    } else {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('❌ Erreur API farms admin:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Créer une nouvelle farm
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ACCOUNT_ID = '7979421604bd07b3bd34d3ed96222512';
    const DATABASE_ID = 'e5ef7989-a88e-422c-9f6b-91d2d3adda12';
    const API_TOKEN = 'ijkVhaXCw6LSddIMIMxwPL5CDAWznxip5x9I1bNW';
    
    const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;
    
    const sql = `INSERT INTO farms (name, description, location, contact) VALUES (?, ?, ?, ?)`;
    const values = [
      body.name,
      body.description || '',
      body.location || '',
      body.contact || ''
    ];
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sql, params: values })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Farm créée avec succès');
      return NextResponse.json({ success: true, id: data.result[0].meta.last_row_id }, { status: 201 });
    } else {
      throw new Error('Erreur création farm');
    }
  } catch (error) {
    console.error('❌ Erreur création farm:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une farm (bulk delete)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

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
        sql: 'DELETE FROM farms WHERE id = ?',
        params: [id]
      })
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Farm supprimée avec succès');
      return NextResponse.json({ success: true, message: 'Farm supprimée avec succès' });
    } else {
      throw new Error('Erreur suppression farm');
    }
  } catch (error) {
    console.error('❌ Erreur suppression farm:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}