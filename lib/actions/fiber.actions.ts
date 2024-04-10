"use server";

import { revalidatePath } from "next/cache";
import Fiber from "../models/fiber.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createFiber({ text, author, communityId, path }: Params) {
  connectToDB();

  try {
    const createdFiber = await Fiber.create({
      text,
      author,
      community: null,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { fibers: createdFiber._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to create fiber: ${error.message}`);
  }
}
