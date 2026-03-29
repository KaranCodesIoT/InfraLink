import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/modules/users/user.model.js';
import * as directoryService from '../src/modules/directory/directory.service.js';
import EmbeddingService from '../src/utils/embedding.utils.js';

dotenv.config();

const seedEmbeddings = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        // Get all active professionals
        const users = await User.find({ 
            isActive: true, 
            role: { $nin: ['unassigned', 'normal_user', 'client', 'admin'] }
            // Optional: add `embedding: { $exists: false }` to only run on users missing embeddings
        });

        console.log(`Found ${users.length} professionals. Generating embeddings...`);

        for (const user of users) {
             try {
                // Fetch their full profile to get skills, rating, price, etc.
                const fullProfile = await directoryService.getProfessionalById(user._id);
                
                if (fullProfile) {
                    const text = EmbeddingService.buildProfessionalText(fullProfile);
                    console.log(`-> Generating embedding for ${fullProfile.name || 'Unknown'}...`);
                    // console.log(`   Text details: ${text}`);
                    
                    const embedding = await EmbeddingService.generateEmbedding(text);
                    
                    if (embedding && embedding.length > 0) {
                        await User.updateOne({ _id: user._id }, { $set: { embedding } });
                        console.log(`  [✓] Saved embedding for ${fullProfile.name}`);
                    } else {
                        console.log(`  [✗] Failed to generate embedding for ${fullProfile.name}`);
                    }
                }
             } catch (err) {
                 console.error(`  [✗] Error processing user ${user._id}:`, err.message);
             }
        }

        console.log('\nDone seeding all accessible embeddings!');
        process.exit(0);
    } catch (error) {
        console.error('Fatal Error seeding embeddings:', error);
        process.exit(1);
    }
};

seedEmbeddings();
