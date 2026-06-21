import { prisma } from "../prisma/prisma.client";

export const realtimeService = {
  async emit(executionId: string, eventType: string, payload: unknown) {
    const event = await prisma.realtimeEvent.create({
      data: {
        executionId,
        eventType,
        payload: payload ?? {},
      },
    });

    console.info(`[RealtimeEvent] ${eventType}`, { executionId, eventId: event.id });
    return event;
  },
};
