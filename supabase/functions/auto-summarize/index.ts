import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { parse } from "https://deno.land/x/xml@2.1.3/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // 2. Fetch The Standard RSS Feed
    const rssResponse = await fetch("https://thestandard.co/category/news/thailand/feed/");
    if (!rssResponse.ok) {
      throw new Error(`Failed to fetch RSS feed: ${rssResponse.statusText}`);
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

    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process up to 5 latest items to stay within Free Tier execution time limits
    const itemsToProcess = items.slice(0, 5);

    for (const item of itemsToProcess) {
      const title = item.title;
      const originalUrl = item.link;
      
      // Clean HTML tags and decode RSS description content
      const rawContent = item.description || item["content:encoded"] || "";
      const cleanedContent = rawContent
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .trim();

      if (!originalUrl || !title || !cleanedContent) {
        skippedCount++;
        continue;
      }

      // Check if article with the same source link already exists
      const { data: existingArticle, error: fetchError } = await supabase
        .from("articles")
        .select("id")
        .eq("original_url", originalUrl)
        .maybeSingle();

      if (fetchError) {
        console.error(`DB Fetch Error for URL ${originalUrl}:`, fetchError.message);
        errorCount++;
        continue;
      }

      if (existingArticle) {
        skippedCount++;
        continue; // Skip already summarized news
      }

      // 4. Summarize using OpenRouter Free Model (gemma-2-9b-it:free)
      try {
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://shortsnews.vercel.app", 
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
          errorCount++;
          continue;
        }

        const openRouterData = await openRouterResponse.json();
        const aiSummary = openRouterData?.choices?.[0]?.message?.content?.trim();

        if (!aiSummary) {
          console.error("OpenRouter returned empty summary content");
          errorCount++;
          continue;
        }

        // 5. Insert new summary into database
        const { error: insertError } = await supabase
          .from("articles")
          .insert({
            title: title,
            summary: aiSummary,
            original_url: originalUrl,
            source: "The Standard",
          });

        if (insertError) {
          console.error(`DB Insert Error for URL ${originalUrl}:`, insertError.message);
          errorCount++;
        } else {
          processedCount++;
        }
      } catch (aiErr: any) {
        console.error(`OpenRouter processing error: ${aiErr.message}`);
        errorCount++;
      }
    }

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
