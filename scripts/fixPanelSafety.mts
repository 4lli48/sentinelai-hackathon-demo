import fs from 'fs';

let code = fs.readFileSync('./client/src/components/DecisionQualityEvidencePanel.tsx', 'utf8');

// Ensure all array mappings are protected with nullish coalescing
code = code.replace(
  '(isAr ? sample.factorsTriggeredAr : sample.factorsTriggeredEn).map',
  '((isAr ? sample.factorsTriggeredAr : sample.factorsTriggeredEn) ?? []).map'
);

code = code.replace(
  'sample.behaviorLevel.toLowerCase()',
  '(sample.behaviorLevel ?? "routine").toLowerCase()'
);

code = code.replace(
  'sample.behaviorLevel',
  '(sample.behaviorLevel ?? "Routine")'
);

fs.writeFileSync('./client/src/components/DecisionQualityEvidencePanel.tsx', code, 'utf8');
console.log('Successfully added safety fallbacks to DecisionQualityEvidencePanel.tsx');
