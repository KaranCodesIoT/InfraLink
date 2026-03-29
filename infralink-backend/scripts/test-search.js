import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { semanticSearchProfessionals } from '../src/modules/search/search.service.js';
import User from '../src/modules/users/user.model.js';

dotenv.config();

const testSearch = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Verify embedding exists for real
        const user = await User.findOne({ name: /abhishek/i }).select('+embedding');
        console.log(`User embedding exists: ${user && user.embedding && user.embedding.length > 0}`);

        // 2. Test search
        const query = 'builder in mumbai';
        console.log(`Testing search for: "${query}"`);
        const results = await semanticSearchProfessionals(query, { limit: 5 });
        
        console.log('Results Count:', results.length);
        if (results.length > 0) {
            console.log('Results:', results.map(r => r.name));
        } else {
            console.log('No results found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error during search test:', err);
        process.exit(1);
    }
};

testSearch();
