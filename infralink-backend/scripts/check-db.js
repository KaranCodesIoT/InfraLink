import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/modules/users/user.model.js';

dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await User.countDocuments();
        const professionals = await User.countDocuments({ 
            role: { $nin: ['unassigned', 'normal_user', 'client', 'admin'] } 
        });
        const withEmbeddings = await User.countDocuments({ 
            embedding: { $exists: true, $not: { $size: 0 } } 
        });
        
        console.log(`Total Users: ${count}`);
        console.log(`Professionals: ${professionals}`);
        console.log(`With Embeddings: ${withEmbeddings}`);
        
        if (professionals > 0 && withEmbeddings === 0) {
            console.log('WARNING: Professionals exist but none have embeddings! Run seed-embeddings.js');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDb();
