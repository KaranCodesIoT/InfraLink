import mongoose from 'mongoose';
import BuilderProject from './src/modules/builderProjects/builderProject.model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const projects = await BuilderProject.find({ 'applications.0': { $exists: true } });
        console.log(`Found ${projects.length} projects with applications`);

        projects.forEach(p => {
            console.log(`Project: ${p.projectName} (${p._id})`);
            p.applications.forEach(a => {
                console.log(`  - AppID: ${a._id}, User: ${a.user}, Status: ${a.status}`);
            });
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
