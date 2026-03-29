import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/modules/users/user.model.js';

dotenv.config();

const inspectUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ name: /abhishek/i });
        if (user) {
            console.log('User found:');
            console.log('ID:', user._id);
            console.log('Role:', user.role);
            console.log('IsActive:', user.isActive);
            console.log('Embedding Length:', user.embedding ? user.embedding.length : 0);
            console.log('Location:', user.location);
        } else {
            console.log('User NOT found!');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectUser();
