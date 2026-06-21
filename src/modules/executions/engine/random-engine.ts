import crypto from "crypto";
import { sha256 } from "../../../shared/utils/tokens";

type Candidate = {
  id: string;
  identifier: string;
  fullName: string;
};

type Prize = {
  id: string;
  quantity: number;
};

export type WinnerSelection = {
  participantId: string;
  prizeId: string | null;
  position: number;
};

const hashForCandidate = (
  seed: string,
  candidate: Candidate,
  index: number,
): string => {
  return sha256(`${seed}:${candidate.id}:${candidate.identifier}:${index}`);
};

export const randomEngine = {
  generateSeed(): { seed: string; seedHash: string } {
    const seed = crypto.randomBytes(32).toString("hex");
    return { seed, seedHash: sha256(seed) };
  },

  selectWinners(params: {
    seed: string;
    participants: Candidate[];
    prizes: Prize[];
    fallbackWinnersCount?: number;
  }): WinnerSelection[] {
    const winnersNeeded =
      params.prizes.length > 0
        ? params.prizes.reduce((sum, prize) => sum + prize.quantity, 0)
        : (params.fallbackWinnersCount ?? 1);

    const shuffled = [...params.participants]
      .map((participant, index) => ({
        participant,
        score: hashForCandidate(params.seed, participant, index),
      }))
      .sort((a, b) => a.score.localeCompare(b.score))
      .map((entry) => entry.participant);

    const winners = shuffled.slice(0, Math.min(winnersNeeded, shuffled.length));
    const prizeSlots = params.prizes.flatMap((prize) =>
      Array.from({ length: prize.quantity }, () => ({ prizeId: prize.id })),
    );

    return winners.map((participant, index) => ({
      participantId: participant.id,
      prizeId: prizeSlots[index]?.prizeId ?? null,
      position: index + 1,
    }));
  },

  buildVerificationHash(params: {
    seedHash: string;
    raffleId: string;
    executionId: string;
    participantIds: string[];
    winners: WinnerSelection[];
  }): string {
    return sha256(
      JSON.stringify({
        seedHash: params.seedHash,
        raffleId: params.raffleId,
        executionId: params.executionId,
        participantIds: params.participantIds.sort(),
        winners: params.winners,
      }),
    );
  },
};
