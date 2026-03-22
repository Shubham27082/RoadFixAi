import { useState } from 'react';

const APITest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { message, type, timestamp }]);
  };

  const testStatsAPI = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('🔍 Starting API test...', 'info');
      
      // Check token
      const token = localStorage.getItem('roadfix_token');
      addResult(`Token exists: ${!!token}`, token ? 'success' : 'error');
      
      if (token) {
        addResult(`Token preview: ${token.substring(0, 30)}...`, 'info');
      }
      
      // Test the stats endpoint
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reports/stats`;
      addResult(`Testing URL: ${url}`, 'info');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      addResult(`Response status: ${response.status}`, response.ok ? 'success' : 'error');
      addResult(`Response ok: ${response.ok}`, response.ok ? 'success' : 'error');
      
      const result = await response.json();
      addResult(`Response data: ${JSON.stringify(result, null, 2)}`, result.success ? 'success' : 'error');
      
    } catch (error) {
      addResult(`❌ Error: ${error.message}`, 'error');
      console.error('API Test Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('🔍 Testing login...', 'info');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'demo.municipal@example.com',
          password: 'demo123',
          userType: 'municipal'
        })
      });
      
      addResult(`Login response status: ${response.status}`, response.ok ? 'success' : 'error');
      
      const result = await response.json();
      addResult(`Login result: ${JSON.stringify(result, null, 2)}`, result.success ? 'success' : 'error');
      
      if (result.success) {
        localStorage.setItem('roadfix_token', result.data.token);
        addResult('✅ Token saved to localStorage', 'success');
      }
      
    } catch (error) {
      addResult(`❌ Login Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Debug Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login & Get Token'}
          </button>
          
          <button
            onClick={testStatsAPI}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Stats API'}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded text-sm font-mono ${
                  result.type === 'success' ? 'bg-green-100 text-green-800' :
                  result.type === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                <span className="text-xs text-gray-500">[{result.timestamp}]</span> {result.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APITest;