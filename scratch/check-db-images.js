const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return {};
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = value;
    }
  });
  
  return env;
}

const checkImages = async () => {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.log("Supabase URL or Anon key is missing in .env.local");
    return;
  }

  console.log(`Connecting to Supabase URL: ${url}`);
  const fetchUrl = `${url}/rest/v1/articles?select=id,title,image_url,original_url&order=created_at.desc&limit=5`;
  
  try {
    const response = await fetch(fetchUrl, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });

    if (!response.ok) {
      const txt = await response.text();
      console.log(`Error fetching articles: ${response.status} - ${txt}`);
      return;
    }

    const data = await response.json();
    console.log("\nLatest 5 Articles in Database:");
    data.forEach((art, index) => {
      console.log(`\n[${index + 1}] Title: ${art.title}`);
      console.log(`    Image URL: "${art.image_url}"`);
      console.log(`    Original URL: "${art.original_url}"`);
    });
  } catch (err) {
    console.error("Error connecting to DB:", err.message);
  }
};

checkImages();
