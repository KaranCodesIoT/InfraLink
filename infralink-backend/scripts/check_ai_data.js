import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

const dbCheck = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            role: String,
            contractorType: String,
            location: { city: String }
        }));

        const count = await User.countDocuments();
        console.log(`Total Users: ${count}`);

        const painters = await User.find({ 
            $or: [
                { role: 'contractor', contractorType: /Painting/i },
                { role: 'labour', skills: /paint/i }
            ]
        });
        console.log(`Painters found: ${painters.length}`);
        
        const mumbaiPainters = await User.find({
            'location.city': /Mumbai/i
        });
        console.log(`Users in Mumbai: ${mumbaiPainters.length}`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

dbCheck();
