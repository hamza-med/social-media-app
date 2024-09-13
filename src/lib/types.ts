import { Prisma } from "@prisma/client";

export const postDataInclude = {
  user: {
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
} satisfies Prisma.PostInclude;

//*Update this type automatically when the type above is updated
export type PostData = Prisma.PostGetPayload<{
  include: typeof postDataInclude;
}>;