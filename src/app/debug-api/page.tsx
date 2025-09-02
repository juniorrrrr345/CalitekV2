'use client';

import { useState } from 'react';

export default function DebugAPI() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testCreateCategory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cloudflare/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'TEST DEBUG API',
          icon: '🔧',
          color: '#FF0000'
        })
      });
      
      const data = await response.text();
      setResult(`Status: ${response.status}\nResponse: ${data}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  const testCreateProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cloudflare/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'TEST PRODUCT DEBUG',
          description: 'Test description',
          category: 'WEED 🇺🇸🍀',
          farm: 'USA WEED',
          price: 50,
          prices: { '5g': 50 },
          image_url: 'https://example.com/test.jpg',
          stock: 10,
          is_available: true
        })
      });
      
      const data = await response.text();
      setResult(`Status: ${response.status}\nResponse: ${data}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug API CALITEK</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testCreateCategory}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Create Category'}
        </button>
        
        <button 
          onClick={testCreateProduct}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Create Product'}
        </button>
      </div>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Result:</h3>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}