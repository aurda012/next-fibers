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

export async function fetchFibers(pageNumber = 1, pageSize = 20) {
  connectToDB();

  try {
    // Calculate the number of fibers to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch the posts that have no parents (top-level threads)
    const fibersQuery = Fiber.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalFibersCount = await Fiber.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const fibers = await fibersQuery.exec();

    const isNext = totalFibersCount > skipAmount + fibers.length;

    return { fibers, isNext };
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to fetch fibers: ${error.message}`);
  }
}

export async function fetchFiberById(id: string) {
  connectToDB();

  try {
    // TODO: Popialte Community
    const fiber = await Fiber.findById(id)
      .populate({ path: "author", model: User, select: "_id id name image" })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Fiber,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return fiber;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to fetch fiber: ${error.message}`);
  }
}

export async function addCommentToFiber(
  fiberId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalFiber = await Fiber.findById(fiberId);

    if (!originalFiber) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentFiber = new Fiber({
      text: commentText,
      author: userId,
      parentId: fiberId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentFiber = await commentFiber.save();

    // Add the comment thread's ID to the original thread's children array
    originalFiber.children.push(savedCommentFiber._id);

    // Save the updated original thread to the database
    await originalFiber.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
