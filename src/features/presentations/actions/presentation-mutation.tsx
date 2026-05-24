import { createServerFn } from "@tanstack/react-start";

import { PresentationStatus } from "#/generated/prisma/enums";
import { prisma } from "#/lib/db";
import { authFnMiddleware } from "#/middleware/auth";
import { generateSlug } from "random-word-slugs";

import {
  createPresentationInputSchema,
  presentationIdInputSchema,
  updatePresentationInputSchema,
} from "../types/schema";

export const createPresentation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createPresentationInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id;

    const presentation = await prisma.presentation.create({
      data: {
        userId,
        title: generateSlug(),
        prompt: data.prompt,
        slideCount: data.slideCount,
        style: data.style,
        tone: data.tone,
        layout: data.layout,
        status: PresentationStatus.COMPLETED,
      },
    });

    // TODO: inngest background job trigger

    return presentation;
  });

export const updatePresentation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updatePresentationInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id;
    const { id, ...patch } = data;

    const existing = await prisma.presentation.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Not found");
    }

    const updateData = patch;

    return prisma.presentation.update({
      where: { id },
      data: updateData,
    });
  });

export const deletePresentation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id;
    const { id, ...patch } = data;

    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    });

    if (!existing) throw new Error("Not found");

    await prisma.presentation.delete({ where: { id: data.id } });

    return {
      ok: true as const,
    };
  });

export const regeneratePresentation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => presentationIdInputSchema.parse(data))
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id;

    const existing = await prisma.presentation.findFirst({
      where: { id: data.id, userId },
    });

    if (!existing) throw new Error("Not found");

    await prisma.presentation.update({
      where: { id: data.id },
      data: {
        status: PresentationStatus.GENERATING,
      },
    });

    // TODO: inngest background job trigger

    return {
      ok: true as const,
    };
  });
