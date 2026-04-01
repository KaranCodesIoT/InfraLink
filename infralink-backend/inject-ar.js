import mongoose from 'mongoose';
import BuilderProject from './src/modules/builderProjects/builderProject.model.js';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Finding a project to inject AR model...');
    const project = await BuilderProject.findOne();
    if (project) {
      // Using a sample house-like glb from Model Viewer or a known free URL
      project.arModelUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
      await project.save();
      console.log(`Successfully injected AR model into project: ${project.projectName} (${project._id})`);
    } else {
      console.log('No builder projects found in the DB. Please create one to test AR.');
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
