import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { parse } from "https://deno.land/x/xml@2.1.3/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map raw RSS categories to The Standard's core sections
const mapCategory = (rawCategories: any): { name: string; slug: string; color: string; icon: string } => {
  const cats: string[] = [];
  
  const extractString = (val: any): string => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") return val["#text"] || JSON.stringify(val);
    return String(val);
  };

  if (Array.isArray(rawCategories)) {
    rawCategories.forEach(c => {
      const s = extractString(c).toLowerCase();
      if (s) cats.push(s);
    });
  } else {
    const s = extractString(rawCategories).toLowerCase();
    if (s) cats.push(s);
  }

  // The Standard Core Sections Mapping Rules
  if (cats.some(c => c.includes("business") || c.includes("wealth") || c.includes("economy") || c.includes("ธุรกิจ") || c.includes("การเงิน") || c.includes("เศรษฐกิจ") || c.includes("หุ้น"))) {
    return { name: "ธุรกิจและเศรษฐกิจ", slug: "business", color: "#f59e0b", icon: "💰" };
  }
  if (cats.some(c => c.includes("tech") || c.includes("technology") || c.includes("เทคโนโลยี") || c.includes("ไอที") || c.includes("gadget"))) {
    return { name: "เทคโนโลยี", slug: "tech", color: "#8b5cf6", icon: "💻" };
  }
  if (cats.some(c => c.includes("world") || c.includes("international") || c.includes("ต่างประเทศ") || c.includes("ต่างแดน"))) {
    return { name: "ต่างประเทศ", slug: "world", color: "#3b82f6", icon: "🌍" };
  }
  if (cats.some(c => c.includes("sport") || c.includes("sports") || c.includes("กีฬา") || c.includes("ฟุตบอล"))) {
    return { name: "กีฬา", slug: "sport", color: "#06b6d4", icon: "⚽" };
  }
  if (cats.some(c => c.includes("pop") || c.includes("entertainment") || c.includes("บันเทิง") || c.includes("ป๊อป") || c.includes("หนัง") || c.includes("เพลง"))) {
    return { name: "ป๊อปและบันเทิง", slug: "pop", color: "#ec4899", icon: "🎬" };
  }
  if (cats.some(c => c.includes("life") || c.includes("lifestyle") || c.includes("ไลฟ์สไตล์") || c.includes("ท่องเที่ยว") || c.includes("กินดื่ม"))) {
    return { name: "ไลฟ์สไตล์", slug: "life", color: "#10b981", icon: "🌱" };
  }
  if (cats.some(c => c.includes("environment") || c.includes("green") || c.includes("สิ่งแวดล้อม") || c.includes("รักษ์โลก"))) {
    return { name: "สิ่งแวดล้อม", slug: "environment", color: "#16a34a", icon: "🍀" };
  }
  if (cats.some(c => c.includes("thailand") || c.includes("ไทย") || c.includes("การเมือง") || c.includes("politics") || c.includes("สังคม") || c.includes("กรุงเทพ"))) {
    return { name: "ประเทศไทย", slug: "thailand", color: "#ef4444", icon: "🏛️" };
  }

  return { name: "ทั่วไป", slug: "general", color: "#6b7280", icon: "📰" };
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!OPENROUTER_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment secrets: OPENROUTER_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY");
    }

    // 1. Initialize Supabase Client with Service Role Key (Bypasses RLS for writing articles)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Fetch The Standard News Feed (Dynamic from query parameters, fallback to general news feed)
    const { searchParams } = new URL(req.url);
    const feedUrlParam = searchParams.get("feed_url");
    const rssUrl = feedUrlParam || "https://thestandard.co/category/news/feed/";

    const rssResponse = await fetch(rssUrl);
    if (!rssResponse.ok) {
      throw new Error(`Failed to fetch RSS feed ${rssUrl}: ${rssResponse.statusText}`);
    }
    const rssText = await rssResponse.text();

    // 3. Parse XML
    const parsedXml: any = parse(rssText);
    const rawItems = parsedXml?.rss?.channel?.item;
    
    // Support single item or multiple items in RSS Feed structure
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No articles found in RSS feed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process up to 5 latest items in parallel to stay safely within Free Tier timeout limits
    const itemsToProcess = items.slice(0, 5);

    const results = await Promise.all(
      itemsToProcess.map(async (item: any) => {
        const title = item.title;
        const originalUrl = item.link;
        
        // Robust string extraction for description & content:encoded
        const getRawContentString = (val: any): string => {
          if (!val) return "";
          if (typeof val === "string") return val;
          if (typeof val === "object") {
            return val["#text"] || JSON.stringify(val);
          }
          return String(val);
        };

        const descriptionStr = getRawContentString(item.description);
        const contentEncodedStr = getRawContentString(item["content:encoded"]);
        const combinedContent = contentEncodedStr || descriptionStr;

        // Clean HTML tags and decode RSS description content
        const cleanedContent = combinedContent
          .replace(/<[^>]*>/g, "") // Remove HTML tags
          .trim();

        // Extract the first image src from the HTML content
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
        const imgMatch = combinedContent.match(imgRegex);
        const imageUrl = imgMatch ? imgMatch[1] : null;

        if (!originalUrl || !title || !cleanedContent) {
          return { status: "skipped" };
        }

        // Check if article with the same source link already exists
        const { data: existingArticle, error: fetchError } = await supabase
          .from("articles")
          .select("id")
          .eq("original_url", originalUrl)
          .maybeSingle();

        if (fetchError) {
          console.error(`DB Fetch Error for URL ${originalUrl}:`, fetchError.message);
          return { status: "error", error: fetchError.message };
        }

        if (existingArticle) {
          return { status: "skipped" };
        }

        // 3.5 Map and resolve Category in database
        const mappedCat = mapCategory(item.category);
        let dbCategoryId = null;

        try {
          const { data: existingCat, error: catFetchErr } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", mappedCat.slug)
            .maybeSingle();

          if (catFetchErr) {
            console.error(`Error fetching category ${mappedCat.slug}:`, catFetchErr.message);
          }

          if (existingCat) {
            dbCategoryId = existingCat.id;
          } else {
            // Dynamic category insertion with branding properties if it does not exist yet
            const { data: newCat, error: catInsertErr } = await supabase
              .from("categories")
              .insert({
                name: mappedCat.name,
                slug: mappedCat.slug,
                color: mappedCat.color,
                icon: mappedCat.icon,
              })
              .select("id")
              .single();

            if (catInsertErr) {
              console.error(`Error inserting category ${mappedCat.slug}:`, catInsertErr.message);
            } else if (newCat) {
              dbCategoryId = newCat.id;
            }
          }
        } catch (catErr: any) {
          console.error("Category resolution exception:", catErr.message);
        }

        // 4. Summarize using OpenRouter Free Model (gemma-2-9b-it:free)
        try {
          const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemma-2-9b-it:free",
              messages: [
                {
                  role: "system",
                  content: "คุณคือบอทสรุปข่าวสารอัจฉริยะภาษาไทย หน้าที่ของคุณคืออ่านเนื้อหาข่าวที่กำหนดให้ แล้วทำการวิเคราะห์และสรุปย่อออกมาเป็นภาษาไทยในรูปแบบหัวข้อย่อย (Bullet points) จำนวน 3 ข้อสั้นๆ กระชับ ได้ใจความสำคัญ ห้ามแสดงเนื้อหาเกริ่นนำ ข้อคิดเห็นส่วนตัว หรือสรุปอื่นๆ นอกเหนือจาก 3 ข้อนี้เด็ดขาด"
                },
                {
                  role: "user",
                  content: `กรุณาสรุปข่าวต่อไปนี้:\n\nหัวข้อ: ${title}\n\nเนื้อหาข่าว:\n${cleanedContent.slice(0, 4000)}`
                }
              ],
              temperature: 0.2,
            }),
          });

          if (!openRouterResponse.ok) {
            const errorMsg = await openRouterResponse.text();
            console.error(`OpenRouter API error: ${errorMsg}`);
            return { status: "error", error: errorMsg };
          }

          const openRouterData = await openRouterResponse.json();
          const aiSummary = openRouterData?.choices?.[0]?.message?.content?.trim();

          if (!aiSummary) {
            console.error("OpenRouter returned empty summary content");
            return { status: "error", error: "Empty summary" };
          }

          // 5. Insert new summary into database
          const { error: insertError } = await supabase
            .from("articles")
            .insert({
              title: title,
              summary: aiSummary,
              original_url: originalUrl,
              source: "The Standard",
              image_url: imageUrl,
              category_id: dbCategoryId,
            });

          if (insertError) {
            console.error(`DB Insert Error for URL ${originalUrl}:`, insertError.message);
            return { status: "error", error: insertError.message };
          }

          return { status: "processed" };
        } catch (aiErr: any) {
          console.error(`OpenRouter processing error: ${aiErr.message}`);
          return { status: "error", error: aiErr.message };
        }
      })
    );

    // Count results
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    results.forEach((res) => {
      if (res.status === "processed") processedCount++;
      else if (res.status === "skipped") skippedCount++;
      else if (res.status === "error") errorCount++;
    });

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        skipped: skippedCount,
        errors: errorCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
