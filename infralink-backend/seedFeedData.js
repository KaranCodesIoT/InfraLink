import mongoose from 'mongoose';
import Post from './src/modules/posts/post.model.js';
import User from './src/modules/users/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/infralink');
        console.log('Connected to MongoDB');

        const ashar = await User.findOne({ name: /ashar/i });
        if (!ashar) {
            console.error('Ashar not found. Please ensure the user exists.');
            process.exit(1);
        }

        console.log(`Seeding posts for ${ashar.name} (${ashar.role})...`);

        const posts = [
            {
                user: ashar._id,
                role: 'builder',
                contentType: 'project_update',
                projectName: 'Skyline Apartments',
                content: 'Excited to announce the completion of the foundation phase for Skyline Apartments! #Construction #Milestone',
                location: 'Mumbai, MH'
            },
            {
                user: ashar._id,
                role: 'builder',
                contentType: 'image',
                content: 'Check out the new architectural rendering for our upcoming commercial hub.',
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
                location: 'Pune, MH'
            },
            {
                user: ashar._id,
                role: 'builder',
                contentType: 'text',
                content: 'Looking for reliable electrical contractors for a new 20-story project in Navi Mumbai. DM for details.'
            }
        ];

        await Post.insertMany(posts);
        console.log('Successfully seeded Ashar\'s posts!');

        // Seed a same-role post (Contractor) for Rohit to see
        const rohit = await User.findOne({ name: /rohit/i });
        if (rohit) {
            await Post.create({
                user: rohit._id,
                role: 'contractor',
                contentType: 'text',
                content: 'Available for interior fit-out projects. Specialists in modular kitchens and false ceilings.'
            });
            console.log('Seeded a post for Rohit as well.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seed();
