import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  role: {
    type: String,
    index: true,
    default: 'unassigned' // Denormalized from user's role for fast ranking
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  image: {
    type: String, // URL from cloudinary/upload
    default: null
  },
  video: {
    type: String, // URL from cloudinary/upload for video posts
    default: null
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'video', 'project_update'],
    default: 'text'
  },
  projectName: {
    type: String,
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Optimization for feed sorting and role-based / user-specific filtering
postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
