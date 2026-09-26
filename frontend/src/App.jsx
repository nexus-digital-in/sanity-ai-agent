import { useState, useEffect } from 'react';
import { createClient } from '@sanity/client';

// Sanity client configuration (Aapka existing setup)
const client = createClient({
  projectId: '9m0pdh3h',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2026-03-01',
});

function App() {
  // Existing states (Sanity entries ke liye)
  const [entries, setEntries] = useState([]);

  // New states (AI Agent chat ke liye)
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  // Existing useEffect (Sanity se initial data fetch karne ke liye)
  useEffect(() => {
    client
      .fetch(`*[_type == "knowledge"]`)
      .then((data) => setEntries(data))
      .catch(console.error);
  }, []);

  // AI Agent function
  const handleAskAgent = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAiAnswer('');

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question }),
      });

      const data = await response.json();

      if (response.ok) {
        setAiAnswer(data.answer);
      } else {
        setAiAnswer(`Error: ${data.error || 'Something went wrong'}`);
      }
    } catch (error) {
      console.error("Frontend Error:", error);
      setAiAnswer("Backend connection error. Please redeploy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Sanity Knowledge Base</h1>
      
      {/* Existing Entries View */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Stored Knowledge Entries:</h3>
        {entries.length === 0 ? (
          <p>No entries found</p>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li key={entry._id} style={{ marginBottom: '10px' }}>
                <strong>{entry.title}</strong>: {entry.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- NEW CHAT UI BOX --- */}
      <div style={{ marginTop: '40px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#fdfdfd' }}>
        <h2>💬 Ask Sanity AI Agent</h2>
        
        <form onSubmit={handleAskAgent} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What is HTML?"
            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #aaa' }}
            disabled={loading}
          />
          <button 
            type="submit" 
            style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}
            disabled={loading}
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>

        {aiAnswer && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f7ff', borderRadius: '5px', borderLeft: '5px solid #0070f3' }}>
            <strong>Agent Response:</strong>
            <p style={{ lineHeight: '1.5', marginTop: '5px', color: '#333' }}>{aiAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;