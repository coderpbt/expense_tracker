import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      default: ""
    },
    featuredImage: {
      type: String,
      default: ""
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categorys"
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
     authorName: {
      type: String,
      required: true,
      trim: true
    },
    tags: [
      {
        type: String
      }
    ],
    viewCount: {
      type: Number,
      default: 0
    },
    isEditorsPick: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    }
  },
  { timestamps: true } // handles createdAt & updatedAt
);

export const postsModel = mongoose.models.posts || mongoose.model("posts", postSchema);
