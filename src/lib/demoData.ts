export const DEMO_PREDICTIONS = {
  "Pneumonia": 87.5,
  "Infiltration": 45.2,
  "Effusion": 23.8,
  "Atelectasis": 18.4,
  "Nodule": 12.6,
  "Mass": 8.9,
  "Cardiomegaly": 6.3,
  "Consolidation": 5.1,
  "Pneumothorax": 3.2,
  "Edema": 2.8,
  "Emphysema": 1.9,
  "Fibrosis": 1.2,
  "Pleural_Thickening": 0.8,
  "Hernia": 0.3
};

export const DEMO_CLINICAL_REPORT = `FINDINGS:
The chest radiograph demonstrates increased opacity in the right lower lobe, consistent with consolidation. The findings suggest an acute infectious process, most likely community-acquired pneumonia.

Key Observations:
• Right lower lobe consolidation with air bronchograms
• Preserved cardiac silhouette
• No evidence of pleural effusion
• Costophrenic angles are sharp bilaterally

IMPRESSION:
1. Right lower lobe pneumonia (87.5% confidence)
2. Consider infiltration in the mid-lung fields (45.2% confidence)
3. No significant pleural effusion or pneumothorax identified

RECOMMENDATIONS:
1. Clinical correlation with patient symptoms and laboratory findings recommended
2. Consider follow-up imaging in 4-6 weeks to ensure resolution
3. Antibiotic therapy as per clinical protocol
4. Monitor for complications such as pleural effusion or lung abscess

Note: This AI-assisted analysis should be reviewed and verified by a qualified radiologist before making clinical decisions.`;

export function generateDemoHeatmap(imageDataUrl: string): string {
  return imageDataUrl;
}
