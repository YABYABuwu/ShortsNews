const fs = require('fs');
const path = require('path');

// Helper to load env variables manually from .env.local
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

async function testRSSWithAI() {
  const env = loadEnv();
  // Check in process.env first, then fallback to .env.local
  const openRouterKey = process.env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY;

  console.log("Fetching RSS Feed from The Standard...");
  try {
    const response = await fetch("https://thestandard.co/category/news/thailand/feed/");
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const xml = await response.text();
    console.log(`Feed fetched successfully! Length: ${xml.length} characters`);

    // A simple regex-based XML item parser
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>([\s\S]*?)<\/title>/;
    const linkRegex = /<link>([\s\S]*?)<\/link>/;
    const descRegex = /<description>([\s\S]*?)<\/description>/;

    const match = itemRegex.exec(xml);
    if (!match) {
      console.log("No articles found in RSS feed.");
      return;
    }

    const itemContent = match[1];
    const titleMatch = itemContent.match(titleRegex);
    const linkMatch = itemContent.match(linkRegex);
    const descMatch = itemContent.match(descRegex);

    const title = titleMatch 
      ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() 
      : "No Title";
    const link = linkMatch 
      ? linkMatch[1].trim() 
      : "No Link";
    const desc = descMatch 
      ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, "").trim() 
      : "No Description";

    console.log("\n--- Latest Article to Summarize ---");
    console.log(`Title: ${title}`);
    console.log(`Link: ${link}`);
    console.log(`Original Description Preview: ${desc.slice(0, 200)}...`);

    // AI Summarization section
    if (!openRouterKey || openRouterKey.includes("your-placeholder") || openRouterKey.includes("your_openrouter")) {
      console.log("\n⚠️ [WARNING]: ไม่พบ OPENROUTER_API_KEY ที่ใช้งานได้ในไฟล์ .env.local หรือ environment variables");
      console.log("กรุณาเพิ่มคีย์จริงดังนี้ในไฟล์ .env.local เพื่อทดสอบระบบ AI:");
      console.log("OPENROUTER_API_KEY=sk-or-v1-...");
      return;
    }

    console.log("\n🤖 Sending request to OpenRouter API (google/gemma-2-9b-it:free)...");
    
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content: "คุณคือบอทสรุปข่าวสารอัจฉริยะภาษาไทย หน้าที่ของคุณคืออ่านเนื้อหาข่าวที่กำหนดให้ แล้วทำการวิเคราะห์และสรุปย่อออกมาเป็นภาษาไทยในรูปแบบหัวข้อย่อย (Bullet points) จำนวน 3 ข้อสั้นๆ กระชับ ได้ใจความสำคัญ ห้ามแสดงเนื้อหาเกริ่นนำ ข้อคิดเห็นส่วนตัว หรือสรุปอื่นๆ นอกเหนือจาก 3 ข้อนี้เด็ดขาด"
          },
          {
            role: "user",
            content: `กรุณาสรุปข่าวต่อไปนี้:\n\nหัวข้อ: ${title}\n\nเนื้อหาข่าว:\n${desc.slice(0, 4000)}`
          }
        ],
        temperature: 0.2,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorMsg = await openRouterResponse.text();
      throw new Error(`OpenRouter API error: ${errorMsg}`);
    }

    const openRouterData = await openRouterResponse.json();
    const aiSummary = openRouterData?.choices?.[0]?.message?.content?.trim();

    console.log("\n✨ --- AI Summary Results ---");
    console.log(aiSummary);
    console.log("-----------------------------");

  } catch (error) {
    console.error("\n❌ Error during execution:", error.message);
  }
}

testRSSWithAI();
