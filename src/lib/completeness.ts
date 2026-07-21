export interface CompletenessItem {
  key: string;
  label: string;
  weight: number;
  isComplete: boolean;
  actionUrl: string;
}

export interface ProviderProfileForCompleteness {
  bio?: string | null;
  serviceRadiusKm?: number | null;
  experienceYears?: number | null;
  documents?: Array<{ status: string }>;
  portfolio?: Array<any>;
  availability?: Array<any>;
}

export function calculateProfileCompleteness(profile: ProviderProfileForCompleteness) {
  const items: CompletenessItem[] = [
    {
      key: "bio",
      label: "Add Bio & Experience Summary",
      weight: 20,
      isComplete: !!profile.bio && profile.bio.trim().length > 10,
      actionUrl: "/provider/profile",
    },
    {
      key: "radius",
      label: "Set Service Radius & Experience",
      weight: 20,
      isComplete: (profile.serviceRadiusKm ?? 0) > 0 && (profile.experienceYears ?? 0) > 0,
      actionUrl: "/provider/profile",
    },
    {
      key: "documents",
      label: "Upload Identity / Address Proof Documents",
      weight: 20,
      isComplete: Array.isArray(profile.documents) && profile.documents.some((d) => d.status === "APPROVED"),
      actionUrl: "/provider/onboarding",
    },
    {
      key: "portfolio",
      label: "Add Past Work Photos to Portfolio",
      weight: 20,
      isComplete: Array.isArray(profile.portfolio) && profile.portfolio.length > 0,
      actionUrl: "/provider/portfolio",
    },
    {
      key: "availability",
      label: "Configure Weekly Working Hours",
      weight: 20,
      isComplete: Array.isArray(profile.availability) && profile.availability.length > 0,
      actionUrl: "/provider/availability",
    },
  ];

  const totalScore = items.reduce((acc, item) => (item.isComplete ? acc + item.weight : acc), 0);
  const missingItems = items.filter((item) => !item.isComplete);

  return {
    score: totalScore,
    isFullyComplete: totalScore === 100,
    items,
    missingItems,
  };
}
