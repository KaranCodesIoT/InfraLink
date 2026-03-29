import fs from 'fs';
import path from 'path';
import natural from 'natural';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Initializing InfraLink Intent Classifier Training ---');

const classifier = new natural.BayesClassifier();
const TRAINING_DIR = path.join(__dirname, '../data/ai_training');

const CHUNK_FILES = [
    'chunk_1.json',
    'chunk_2.json',
    'chunk_3.json',
    'chunk_4.json',
    'chunk_5.json'
];

let totalDocs = 0;

for (const file of CHUNK_FILES) {
    const filePath = path.join(TRAINING_DIR, file);
    if (!fs.existsSync(filePath)) {
        console.warn(`[!] Skipping ${file} (not found at ${filePath})`);
        continue;
    }

    try {
        console.log(`Loading dataset from ${file}...`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        let addedCount = 0;
        for (const item of data) {
            if (item.query && item.intent) {
                classifier.addDocument(item.query, item.intent);
                addedCount++;
                totalDocs++;
            }
        }
        console.log(`  -> Added ${addedCount} documents from ${file}`);
    } catch (err) {
        console.error(`  [!] Error parsing ${file}: ${err.message}`);
    }
}

if (totalDocs === 0) {
    console.error('\n[ERROR] No training data found. Exiting.');
    process.exit(1);
}

console.log(`\nStarting training on ${totalDocs} total records... (This may take a moment)`);

classifier.events.on('trainedWithDocument', function (obj) {
    if (obj.index % 1000 === 0 && obj.index > 0) {
        console.log(`  Progress: ${obj.index}/${obj.total} documents trained...`);
    }
});

classifier.train();

const MODEL_PATH = path.join(__dirname, '../src/modules/ai/assistant/intent_model.json');
classifier.save(MODEL_PATH, (err) => {
    if (err) {
        console.error('\n[ERROR] Failed to save trained model:', err);
        process.exit(1);
    }
    console.log(`\n[SUCCESS] Model successfully trained and saved to:`);
    console.log(`-> ${MODEL_PATH}`);
});
