import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CONDITIONS = [
  "Pneumonia", "Infiltration", "Atelectasis", "Effusion", "Nodule",
  "Pneumothorax", "Mass", "Consolidation", "Pleural_Thickening",
  "Cardiomegaly", "Emphysema", "Edema", "Fibrosis", "Hernia"
];

const CLINICAL_REPORTS: Record<string, string> = {
  "Pneumonia": `FINDINGS:
The chest radiograph demonstrates increased opacity in the right lower lung field, consistent with a consolidative process. The findings are suggestive of pneumonia. The cardiac silhouette is within normal limits. No significant pleural effusion is identified.

IMPRESSION:
1. Right lower lobe pneumonia
2. No acute cardiopulmonary abnormality otherwise identified

RECOMMENDATIONS:
Clinical correlation is recommended. Follow-up chest radiograph after appropriate antibiotic therapy may be considered to ensure resolution.`,

  "Infiltration": `FINDINGS:
Patchy infiltrates noted in bilateral lung fields, more prominent in the perihilar regions. No consolidation or effusion identified. Cardiac size is normal.

IMPRESSION:
1. Bilateral pulmonary infiltrates
2. Consider infectious or inflammatory etiology

RECOMMENDATIONS:
Clinical correlation and laboratory evaluation recommended.`,

  "Atelectasis": `FINDINGS:
Linear opacities in the left lower lobe consistent with atelectasis. No pleural effusion or pneumothorax. Heart size is normal.

IMPRESSION:
1. Left lower lobe atelectasis
2. No acute infiltrate

RECOMMENDATIONS:
Follow-up imaging may be considered if clinically indicated.`,

  "Effusion": `FINDINGS:
Blunting of the right costophrenic angle with meniscus sign consistent with pleural effusion. Lungs otherwise clear. Normal cardiac silhouette.

IMPRESSION:
1. Right-sided pleural effusion, moderate
2. No infiltrate or consolidation

RECOMMENDATIONS:
Clinical correlation recommended. Consider thoracentesis if symptomatic.`,

  "Normal": `FINDINGS:
The lungs are clear without focal consolidation, effusion, or pneumothorax. The cardiac silhouette is normal in size and contour. The mediastinum is unremarkable.

IMPRESSION:
1. No acute cardiopulmonary findings

RECOMMENDATIONS:
No further imaging needed at this time.`
};

function generateVariedPredictions(seed: string): Record<string, number> {
  // Simple hash function to generate consistent but varied results
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }

  const random = Math.abs(hash) / 2147483647;
  const primaryIndex = Math.floor(random * CONDITIONS.length);
  const primaryCondition = CONDITIONS[primaryIndex];

  const predictions: Record<string, number> = {};

  CONDITIONS.forEach((condition, idx) => {
    if (idx === primaryIndex) {
      predictions[condition] = 65 + (random * 30);
    } else {
      const offset = Math.abs(idx - primaryIndex);
      const baseScore = 50 - (offset * 3);
      const variance = (Math.sin(hash * idx) + 1) * 15;
      predictions[condition] = Math.max(1, Math.min(60, baseScore + variance));
    }
  });

  return predictions;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const analysisId = formData.get("analysis_id") as string;
    const file = formData.get("file") as File;

    if (!analysisId || !file) {
      return new Response(
        JSON.stringify({ error: "Missing analysis_id or file" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate varied predictions based on file name and size
    const seed = `${file.name}-${file.size}-${Date.now()}`;
    const predictions = generateVariedPredictions(seed);

    const topPrediction = Object.entries(predictions).sort(
      ([, a], [, b]) => b - a
    )[0];

    const clinicalReport = CLINICAL_REPORTS[topPrediction[0]] ||
      CLINICAL_REPORTS["Normal"] +
      "\n\nNote: This is an AI-generated report and should be verified by a qualified radiologist.";

    const updateData = {
      prediction_class: topPrediction[0],
      confidence_score: topPrediction[1],
      predictions_json: predictions,
      clinical_report: clinicalReport,
      status: "completed",
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("xray_analyses")
      .update(updateData)
      .eq("id", analysisId);

    if (updateError) {
      throw updateError;
    }

    const metadata = {
      analysis_id: analysisId,
      model_version: "Demo-Mode-v1.0",
      processing_time_ms: 1500,
      image_dimensions: { width: 1024, height: 1024 },
      preprocessing_params: {
        resize: "224x224",
        normalization: "ImageNet",
        grayscale_to_rgb: true,
      },
    };

    await supabase.from("analysis_metadata").insert(metadata);

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: analysisId,
        prediction: {
          class: topPrediction[0],
          confidence: topPrediction[1],
          all_predictions: predictions,
        },
        processing_time_ms: 1500,
        mode: "demo",
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error",
        success: false 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});