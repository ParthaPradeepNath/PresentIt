import { createServerFn } from "@tanstack/react-start";

import { prisma } from "#/lib/db";
import { authMiddleware } from "#/middleware/auth";

import { presentationIdInputSchema } from "../types/schema";

export const getPresentationWithSlides = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    const userID = context?.session.user.id;

    const row = await prisma.presentation.findFirst({
      where: {
        id: data.id,
        userId: userID,
      },
      include: {
        slides: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return row;
  });


  export const listPresentation = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context?.session.user.id;

    return prisma.presentation.findMany({
      where: {userId},
      orderBy: {
        updatedAt: "desc"
      }
    })
  })