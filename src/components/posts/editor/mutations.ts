import { useToast } from "@/hooks/use-toast";
import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { submitPost } from "./actions";
import { useSession } from "@/app/(main)/SessionProvider";

//*Update the query filter to update the feeds for both your feed and logged in user feed in your
//*profile
export function useSubmitPostMutation() {
  const { toast } = useToast();
  const { user } = useSession();
  const queryClient = useQueryClient();
  //*We add satisfies to tell TS that it can't be undefined
  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      //*It will get from cache queries having the key "post-feed" after that we need to be specific
      //*to add post only to the user logged in so we use predicate to specify the keys of other
      //*queries also having "post-feed"
      //*For delete we don't need that because we have the id of that particular post
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(user.id))
          );
        },
      } satisfies QueryFilters;
      //*first step is to cancel the query
      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );
      //?predicate is part of queryFilter and it is used to invalidate the query if the data is empty
      //? so predicate allows you to right logic
      queryClient.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });

      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  return mutation;
}
