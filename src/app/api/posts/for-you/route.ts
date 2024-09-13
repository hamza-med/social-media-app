//*? This is a route handler it is similar to server actions but in server actions you only post data
//*In server action the http operation are abstracted away from us so we can return a value
//* but this is a server end point so we
//*need to handle it manually (return JSON Response)

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { PostsPage, postDataInclude } from "@/lib/types";
import { NextRequest } from "next/server";
//? cursor is the id of the post that comes after the last post of this page
export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const { user } = await validateRequest();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const posts = await prisma.post.findMany({
      include: postDataInclude,
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    
    //? the +1 only to know the next cursor so we need to slice the array
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
