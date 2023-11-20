import { clerkClient } from "@clerk/nextjs";
import { type User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
  return {id: user.id, username: user.username, profileImageUrl: user.imageUrl};
}

export const profileRouter = createTRPCRouter({
    getUserByUsername: publicProcedure.input(z.object({ username: z.string() })).
    query(async ({ input }) => {
        const [user] = await clerkClient.users.getUserList({
            username: [input.username.replace("@","")],
        });

        if (!user) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "User not found" });
        }

        return filterUserForClient(user);
    }),
});