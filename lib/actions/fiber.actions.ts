"use server";

import { revalidatePath } from "next/cache";
import Fiber from "../models/fiber.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Community from "../models/community.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createFiber({ text, author, communityId, path }: Params) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdFiber = await Fiber.create({
      text,
      author,
      community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { fibers: createdFiber._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { fibers: createdFiber._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    console.error(error);
    throw new Error(`Failed to create fiber: ${error.message}`);
  }
}

async function fetchAllChildFibers(fiberId: string): Promise<any[]> {
  const childFibers = await Fiber.find({ parentId: fiberId });

  const descendantFibers = [];
  for (const childFiber of childFibers) {
    const descendants = await fetchAllChildFibers(childFiber._id);
    descendantFibers.push(childFiber, ...descendants);
  }

  return descendantFibers;
}

export async function deleteFiber(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the fiber to be deleted (the main fiber)
    const mainFiber = await Fiber.findById(id).populate("author community");

    if (!mainFiber) {
      throw new Error("Fiber not found");
    }

    // Fetch all child fibers and their descendants recursively
    const descendentFibers = await fetchAllChildFibers(id);

    // Get all descendant fiber IDs including the main fiber ID and child fiber IDs
    const descendentFibersIds = [
      id,
      ...descendentFibers.map((fiber) => fiber._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendentFibers.map((fiber) => fiber.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainFiber.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendentFibers.map((fiber) => fiber.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainFiber.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child fibers and their descendants
    await Fiber.deleteMany({ _id: { $in: descendentFibersIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { fibers: { $in: descendentFibersIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { fibers: { $in: descendentFibersIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete fiber: ${error.message}`);
  }
}

export async function fetchFibers(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    // Calculate the number of fibers to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch the posts that have no parents (top-level fibers)
    const fibersQuery = Fiber.find({
      parentId: { $in: [null, undefined] },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "community",
        model: Community,
      })
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
  try {
    connectToDB();

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
  try {
    connectToDB();

    // Find the original fiber by its ID
    const originalFiber = await Fiber.findById(fiberId);

    if (!originalFiber) {
      throw new Error("Fiber not found");
    }

    // Create the new comment fiber
    const commentFiber = new Fiber({
      text: commentText,
      author: userId,
      parentId: fiberId, // Set the parentId to the original fiber's ID
    });

    // Save the comment fiber to the database
    const savedCommentFiber = await commentFiber.save();

    // Add the comment fiber's ID to the original fiber's children array
    originalFiber.children.push(savedCommentFiber._id);

    // Save the updated original fiber to the database
    await originalFiber.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
