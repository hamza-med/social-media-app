//? Server actions is a way of sending data without the old way of post request and http request

"use server";

import { lucia, validateRequest } from "@/auth";
import { SignUpValues, signUpSchema } from "@/lib/validation";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import prisma from "@/lib/prisma";
import { isRedirectError } from "next/dist/client/components/redirect";
export async function signup(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { email, username, password } = signUpSchema.parse(credentials); //? we put the parsing to also validate the credentials on teh backend
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32,
    });

    const userId = generateIdFromEntropySize(10);
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", //* case insensitive
        },
      },
    });

    if (existingUsername) {
      return { error: "Username already exists" };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive", //* case insensitive
        },
      },
    });

    if (existingEmail) {
      return { error: "Email already exists" };
    }

    await prisma.user.create({
      data: {
        id: userId,
        username,
        displayName: username,
        email,
        passwordHash,
      },
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { error: "Something went wrong. Please try again" };
  }
}


