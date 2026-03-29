import fs from 'fs';
import path from 'path';
import natural from 'natural';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data/ai_training');
const CHUNKS = ['chunk_1.json', 'chunk_2.json', 'chunk_3.json', 'chunk_4.json', 'chunk_5.json'];

const intentClassifier = new natural.BayesClassifier();
const skillClassifier = new natural.BayesClassifier();

console.log("🚀 Starting AI Model Training with Natural NLP...");

const trainModels = () => {
    let totalRecords = 0;
    
    for (const chunkFile of CHUNKS) {
        const filePath = path.join(DATA_DIR, chunkFile);
        if (fs.existsSync(filePath)) {
            try {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                console.log(`Loading ${chunkFile}... (${data.length} records)`);
                
                for (const item of data) {
                    if (item.query && item.intent) {
                        // Train Intent Detection
                        intentClassifier.addDocument(item.query.toLowerCase(), item.intent.toLowerCase());
                        
                        // Train Skill/Role Extraction (only if skill exists)
                        if (item.skill && item.skill !== "None") {
                            skillClassifier.addDocument(item.query.toLowerCase(), item.skill.toLowerCase());
                        }
                    }
                }
                totalRecords += data.length;
            } catch (err) {
                console.error(`❌ Error parsing ${chunkFile}:`, err.message);
            }
        } else {
            console.warn(`⚠️ Warning: ${chunkFile} not found.`);
        }
    }
    
    console.log(`✅ Loaded ${totalRecords} training records.`);
    
    console.log("🧠 Training Intent Classifier...");
    intentClassifier.train();
    
    console.log("🧠 Training Skill Classifier...");
    skillClassifier.train();
    
    const intentModelPath = path.join(DATA_DIR, 'intent_model.json');
    const skillModelPath = path.join(DATA_DIR, 'skill_model.json');
    
    intentClassifier.save(intentModelPath, (err) => {
        if (err) console.error("❌ Failed to save intent model", err);
        else console.log(`💾 Intent model saved to ${intentModelPath}`);
    });
    
    skillClassifier.save(skillModelPath, (err) => {
        if (err) console.error("❌ Failed to save skill model", err);
        else console.log(`💾 Skill model saved to ${skillModelPath}`);
    });
    
    console.log("🎉 Training Complete!");
};

trainModels();
