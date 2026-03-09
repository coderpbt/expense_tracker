// db/query/queries.js
import mongoose from "mongoose";
import { dbConnect } from "../dbConnection/dbConnection";
import { postsModel } from "../schema/posts-models";





export async function getAllPosts(){
  await dbConnect();
  const post = await postsModel.find().lean()
  return post;
}

export async function createPost(data) {
  await dbConnect();
  const post = await postsModel.create(data);
  return post;
}

