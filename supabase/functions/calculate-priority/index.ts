
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { issue_type, description, location } = await req.json()

        // 1. Keyword Analysis
        const urgentKeywords = ['danger', 'accident', 'fire', 'blocked', 'fallen', 'broken', 'leak', 'flood'];
        const highKeywords = ['pothole', 'garbage', 'dark', 'unsafe'];

        let score = 50; // Base score

        if (urgentKeywords.some(w => description?.toLowerCase().includes(w))) {
            score += 30;
        } else if (highKeywords.some(w => description?.toLowerCase().includes(w))) {
            score += 15;
        }

        // 2. Location Analysis (Mock)
        // In a real app, we'd check against a GIS database for high-traffic areas
        if (location?.includes('Main St') || location?.includes('Highway')) {
            score += 10;
        }

        // 3. Issue Type weighting
        const typeWeights = {
            'pothole': 10,
            'streetlight': 5,
            'garbage': 20, // Health hazard
            'water': 25    // Resource loss
        };

        if (issue_type && typeWeights[issue_type]) {
            score += typeWeights[issue_type];
        }

        // Cap score at 100
        score = Math.min(100, Math.max(0, score));

        // Determine level
        let level = 'low';
        if (score >= 80) level = 'high';
        else if (score >= 40) level = 'medium';

        return new Response(
            JSON.stringify({
                priority_score: score,
                priority_level: level
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})
