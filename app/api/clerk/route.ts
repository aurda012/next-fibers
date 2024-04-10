import { NextApiRequest, NextApiResponse } from "next";

const clerkApiUrl = "https://api.clerk.dev/v1";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  console.log(JSON.parse(req.body));

  // let image = req.body.image;
  // let userId = req.body.userId;

  res.status(200).json({ text: "Hello" });

  // try {
  //   // Update in Clerk
  //   const updateClerk = await fetch(`${clerkApiUrl}/users/${userId}`, {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
  //       // "Content-Type": "multipart/form-data",
  //     },
  //     body: image, // body data type must match "Content-Type" header
  //   });

  //   console.log(await updateClerk.json());

  //   res.status(200).json({ text: "Hello" });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ text: "Failed to update user" });
  // }
}
