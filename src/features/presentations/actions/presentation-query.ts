import {createServerFn} from '@tanstack/react-start'
import { presentationIdInputSchema } from '../types/schema'
import { authMiddleware } from '#/middleware/auth'
import { prisma } from '#/lib/db'

export const getPresentationWithSlides = createServerFn({ method: 'GET' })
.inputValidator((data:unknown) => presentationIdInputSchema.parse(data))
.middleware([authMiddleware])
.handler(async ({ data, context}) => {
     const userID = context?.session.user.id

    const row = await prisma.presentation.findFirst({
        where: {
            id: data.id,
            userId: userID,
        },
        include: {
            slides: {
                orderBy: {
                    order: 'asc'
                }
            }
        }
    })

    return row;
})