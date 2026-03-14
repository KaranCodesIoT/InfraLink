import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/modules/users/user.model.js';
import WorkerProfile from '../src/modules/workers/workerProfile.model.js';
import Job from '../src/modules/jobs/job.model.js';
import { hashPassword } from '../src/utils/encryption.utils.js';

dotenv.config();

const seed = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected. Seeding database...');

    // Clear existing demo data
    await User.deleteMany({ email: /seed@infralink/ });
    await Job.deleteMany({ title: /\[SEED\]/ });

    // Create demo users
    const hashedPwd = await hashPassword('Password123!');

    const client = await User.create({
        name: 'Demo Client', email: 'client.seed@infralink.com', password: hashedPwd, role: 'client', isVerified: true,
    });

    const worker = await User.create({
        name: 'Demo Worker', email: 'worker.seed@infralink.com', password: hashedPwd, role: 'worker', isVerified: true,
    });

    await WorkerProfile.create({
        user: worker._id,
        skills: ['plumbing', 'welding', 'masonry'],
        yearsOfExperience: 5,
        trade: 'Plumber',
        isAvailable: true,
        hourlyRate: 500,
        dailyRate: 3000,
        averageRating: 4.5,
    });

    await Job.create({
        title: '[SEED] Plumber Needed for New Construction',
        description: 'Looking for an experienced plumber for a new residential project in Delhi.',
        client: client._id,
        requiredSkills: ['plumbing'],
        status: 'open',
        budget: { min: 10000, max: 50000 },
        isUrgent: false,
    });

    console.log('✅ Database seeded successfully!');
    console.log('   Client   → client.seed@infralink.com / Password123!');
    console.log('   Worker   → worker.seed@infralink.com / Password123!');
    await mongoose.disconnect();
};

seed().catch((e) => { console.error(e); process.exit(1); });
