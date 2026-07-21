import { RequestStatus } from "@prisma/client";

export const VALID_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["MATCHING", "ASSIGNED", "CANCELLED"],
  MATCHING: ["ASSIGNED", "EXPIRED", "CANCELLED"],
  ASSIGNED: ["ACCEPTED", "EXPIRED", "CANCELLED"],
  ACCEPTED: ["EN_ROUTE", "CANCELLED"],
  EN_ROUTE: ["ARRIVED_NEARBY", "ARRIVED", "CANCELLED"],
  ARRIVED_NEARBY: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED"], // IN_PROGRESS requires OTP verification
  IN_PROGRESS: ["COMPLETION_REVIEW", "DISPUTED", "CANCELLED"],
  COMPLETION_REVIEW: ["COMPLETED", "DISPUTED"],
  COMPLETED: ["DISPUTED"],
  CANCELLED: [],
  EXPIRED: [],
  DISPUTED: ["COMPLETED", "CANCELLED"],
};

export function canTransition(currentStatus: RequestStatus, targetStatus: RequestStatus): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}

export function getStatusStepNumber(status: RequestStatus): number {
  switch (status) {
    case "SUBMITTED":
    case "MATCHING":
      return 1;
    case "ASSIGNED":
    case "ACCEPTED":
      return 2;
    case "EN_ROUTE":
    case "ARRIVED_NEARBY":
    case "ARRIVED":
      return 3;
    case "IN_PROGRESS":
      return 4;
    case "COMPLETION_REVIEW":
    case "COMPLETED":
      return 5;
    default:
      return 0;
  }
}
