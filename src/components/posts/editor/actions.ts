"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

//*In react query the mutation function accepts only 1 argument so you need to pass object in case of
//*multiple arguments
export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  //*Check the if the user is authenticated
  const { user } = await validateRequest();

  if (!user) throw new Error("Unauthorized");

  const { content, mediaIds } = createPostSchema.parse(input);

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      attachments: {
        connect : mediaIds.map((id) => ({ id })),
      }
    },
    include: getPostDataInclude(user.id),
  });

  return newPost;
}
