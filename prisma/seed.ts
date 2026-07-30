/**
 * Seed: v1 taxonomy, Shivamogga localities, demo users, platform content.
 * Run: `npx prisma db seed`
 */
import { PrismaClient, UserRole, ProviderStatus, VerificationStatus, WorkType } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

const prisma = new PrismaClient();

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ---- Taxonomy -------------------------------------------------------------
const TAXONOMY: { name: string; icon: string; subs: string[] }[] = [
  {
    name: "Electrical Services",
    icon: "zap",
    subs: [
      "Fan Repair & Installation",
      "Switch, Socket & Switchboard Repair",
      "Lights & Chandelier Installation",
      "House Wiring & Short Circuit Troubleshooting",
      "MCB, Fuse & Distribution Board Repair",
      "Inverter Installation & Service",
      "Doorbell & Intercom Repair",
    ],
  },
  {
    name: "Plumbing Services",
    icon: "droplet",
    subs: [
      "Tap, Mixer & Faucet Repair",
      "Toilet, Flush & Commode Repair",
      "Pipe Leakage & Line Repair",
      "Sink, Washbasin & Drain Unclogging",
      "Water Pump & Motor Repair",
      "Geyser Installation & Connection",
      "Water Filter (RO) Installation & Service",
    ],
  },
  {
    name: "Carpentry & Woodwork",
    icon: "hammer",
    subs: [
      "Door, Window & Hinges Repair",
      "Wardrobe, Drawer & Cabinet Fixing",
      "Door Lock, Handle & Latch Installation",
      "Furniture Assembly & Repair",
      "Wall Shelves, TV Units & Mirror Hanging",
      "Balcony Safety Net & Mesh Installation",
    ],
  },
  {
    name: "Appliance Repair",
    icon: "tv",
    subs: [
      "AC Service & Repair",
      "Washing Machine Repair",
      "Refrigerator Repair",
      "Microwave & Oven Repair",
      "Kitchen Chimney & Hob Cleaning",
      "TV Mounting & Installation",
    ],
  },
  {
    name: "Cleaning & Sanitation",
    icon: "sparkles",
    subs: [
      "Deep Bathroom Cleaning",
      "Deep Kitchen Cleaning",
      "Full Home Deep Cleaning",
      "Sofa & Carpet Shampooing",
      "Water Tank & Sump Cleaning",
    ],
  },
  {
    name: "Pest Control",
    icon: "bug",
    subs: [
      "Cockroach & Ant Control",
      "Termite Treatment",
      "Bed Bugs Treatment",
      "Mosquito & General Insect Control",
    ],
  },
  {
    name: "Painting & Waterproofing",
    icon: "paint-roller",
    subs: [
      "Interior House Painting",
      "Exterior Painting & Putty",
      "Wall Putty & Damp Repair",
      "Terrace & Bathroom Waterproofing",
      "Wood Polishing & Varnish",
    ],
  },
  {
    name: "Salon & Grooming",
    icon: "scissors",
    subs: [
      "Haircut, Styling & Color",
      "Facial, Scrub & Bleach",
      "Waxing & Threading",
      "Manicure & Pedicure",
      "Bridal & Party Makeup",
    ],
  },
  {
    name: "Education & Coaching",
    icon: "book",
    subs: [
      "Home Tuition (K-10)",
      "Exam Coaching (PUC / CET)",
      "Spoken English & Communication",
      "Coding & Computer Classes",
    ],
  },
];

// ---- Shivamogga localities ------------------------------------------------
const LOCALITIES = [
  "Vidyanagar",
  "Gandhi Bazaar",
  "Durgigudi",
  "Basaveshwara Nagar",
  "Nehru Road",
  "Shankaraghatta",
  "Vinoba Nagar",
  "Sagar Road",
  "B.H. Road",
  "Ashoka Road",
  "Jayanagar",
  "Kuvempu Nagar",
];

async function main() {
  console.log("Cleaning up old categories not in the new taxonomy...");
  const newCategorySlugs = TAXONOMY.map(cat => slug(cat.name));
  
  // Set isActive = false for categories not in the new list
  await prisma.category.updateMany({
    where: {
      slug: { notIn: newCategorySlugs }
    },
    data: {
      isActive: false
    }
  });

  // Ensure seeded categories are active
  await prisma.category.updateMany({
    where: {
      slug: { in: newCategorySlugs }
    },
    data: {
      isActive: true
    }
  });

  console.log("Seeding categories & subservices...");
  for (const [ci, cat] of TAXONOMY.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: slug(cat.name) },
      update: { name: cat.name, iconKey: cat.icon, sortOrder: ci, isActive: true },
      create: { name: cat.name, slug: slug(cat.name), iconKey: cat.icon, sortOrder: ci, isActive: true },
    });

    const newSubSlugs = cat.subs.map(sub => slug(sub));
    // Deactivate subservices that are not in the new list for this category
    await prisma.subservice.updateMany({
      where: {
        categoryId: category.id,
        slug: { notIn: newSubSlugs }
      },
      data: {
        isActive: false
      }
    });

    for (const [si, sub] of cat.subs.entries()) {
      await prisma.subservice.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: slug(sub) } },
        update: { name: sub, sortOrder: si, isActive: true },
        create: { categoryId: category.id, name: sub, slug: slug(sub), sortOrder: si, isActive: true },
      });
    }
  }

  console.log("Seeding service areas...");
  for (const [i, name] of LOCALITIES.entries()) {
    await prisma.serviceArea.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { name, slug: slug(name), sortOrder: i },
    });
  }

  console.log("Seeding platform settings...");
  const settings: [string, string, string, string][] = [
    ["support_email", "cnbhuvan011@gmail.com", "string", "support"],
    ["support_phone", "+91 80000 00000", "string", "support"],
    ["default_city", "Shivamogga", "string", "general"],
    ["provider_auto_approve", "false", "boolean", "providers"],
    ["featured_category_slugs", JSON.stringify(["electrical-services", "plumbing-services"]), "json", "featured"],
  ];
  for (const [key, value, valueType, group] of settings) {
    await prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, valueType, group, isPublic: group !== "providers" },
    });
  }

  console.log("Seeding FAQs & static pages...");
  // Clear old entries to prevent duplicates upon repeated seed execution
  await prisma.fAQ.deleteMany({});
  const faqs = [
    ["How do I request a service?", "Pick a category, choose the service you need, select your locality, and submit the requirement form. A verified provider will be matched to you."],
    ["Are providers verified?", "Yes. Every provider submits ID and address proof and is manually reviewed by our team before becoming visible."],
    ["Do I pay through the app?", "Not in v1. Payment is settled directly with the provider after the job. In-app payments are planned for a later release."],
    ["Which areas do you cover?", "We currently operate across Shivamogga. More cities are coming soon."],
  ];
  for (const [i, [q, a]] of faqs.entries()) {
    await prisma.fAQ.create({ data: { question: q, answer: a, sortOrder: i } }).catch(() => {});
  }
  for (const [s, t] of [["privacy", "Privacy Policy"], ["terms", "Terms of Service"], ["about", "About Us"], ["support", "Support"]]) {
    await prisma.staticPage.upsert({
      where: { slug: s },
      update: {},
      create: { slug: s, title: t, body: `# ${t}\n\nContent coming soon.`, status: "PUBLISHED" },
    });
  }

  console.log("Seeding testimonials...");
  // Clear old testimonials to prevent duplicates
  await prisma.testimonial.deleteMany({});
  const testimonials = [
    ["Anitha R.", "Homeowner, Vidyanagar", "Found a reliable electrician within an hour. The verification badge gave me real peace of mind."],
    ["Mahesh K.", "Resident, Gandhi Bazaar", "Booked a full home cleaning before Diwali. Professional and on time."],
    ["Sushma P.", "Parent, Jayanagar", "Got a great maths tutor for my daughter. Loved how easy the request form was."],
  ];
  for (const [i, [n, r, q]] of testimonials.entries()) {
    await prisma.testimonial.create({ data: { authorName: n, authorRole: r, quote: q, isFeatured: true, sortOrder: i } }).catch(() => {});
  }

  console.log("Seeding demo users...");
  const defaultPasswordHash = hashPassword("password123");

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@cloudaif.in" },
    update: { passwordHash: defaultPasswordHash },
    create: { email: "admin@cloudaif.in", name: "Platform Admin", role: UserRole.SUPER_ADMIN, emailVerified: new Date(), passwordHash: defaultPasswordHash },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "customer@example.com",
      name: "Ravi Kumar",
      role: UserRole.CUSTOMER,
      emailVerified: new Date(),
      passwordHash: defaultPasswordHash,
      customerProfile: { create: { displayName: "Ravi", defaultLocality: "Vidyanagar" } },
    },
  });

  const electricalServices = await prisma.category.findUnique({ where: { slug: "electrical-services" } });
  const providerUser = await prisma.user.upsert({
    where: { email: "provider@example.com" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "provider@example.com",
      name: "Suresh Electricals",
      role: UserRole.PROVIDER,
      emailVerified: new Date(),
      passwordHash: defaultPasswordHash,
      providerProfile: {
        create: {
          legalName: "Suresh Nayak",
          displayName: "Suresh Electricals",
          publicSlug: "suresh-electricals",
          businessName: "Suresh Electricals",
          headline: "Trusted electrician serving Shivamogga since 2015",
          workType: WorkType.SOLO,
          primaryCategoryId: electricalServices?.id,
          experienceYears: 9,
          languages: ["Kannada", "Hindi", "English"],
          serviceRadiusKm: 12,
          status: ProviderStatus.APPROVED,
          verificationStatus: VerificationStatus.APPROVED,
          verifiedBadge: true,
          isActive: true,
          completenessScore: 95,
          ratingAverage: 4.8,
          ratingCount: 27,
          jobsCompleted: 41,
          termsAcceptedAt: new Date(),
        },
      },
    },
  });

  // ---- Provider sub-data, a pending provider, and a sample request/assignment ----
  const provider = await prisma.providerProfile.findUnique({ where: { userId: providerUser.id } });
  const fanInstallation = await prisma.subservice.findFirst({ where: { slug: "fan-repair-installation" } });
  const vidyanagar = await prisma.serviceArea.findUnique({ where: { slug: "vidyanagar" } });

  if (provider && electricalServices && fanInstallation && vidyanagar) {
    await prisma.providerCategory.upsert({
      where: { providerId_categoryId: { providerId: provider.id, categoryId: electricalServices.id } },
      update: {},
      create: { providerId: provider.id, categoryId: electricalServices.id },
    });
    await prisma.providerSubservice.upsert({
      where: { providerId_subserviceId: { providerId: provider.id, subserviceId: fanInstallation.id } },
      update: {},
      create: { providerId: provider.id, subserviceId: fanInstallation.id },
    });
    await prisma.providerServiceArea.upsert({
      where: { providerId_serviceAreaId: { providerId: provider.id, serviceAreaId: vidyanagar.id } },
      update: {},
      create: { providerId: provider.id, serviceAreaId: vidyanagar.id },
    });
    // weekly availability Mon-Sat 9-18
    for (const day of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const) {
      const exists = await prisma.providerAvailability.findFirst({ where: { providerId: provider.id, dayOfWeek: day } });
      if (!exists) {
        await prisma.providerAvailability.create({
          data: { providerId: provider.id, type: "WEEKLY_RECURRING", dayOfWeek: day, startTime: "09:00", endTime: "18:00" },
        });
      }
    }
    await prisma.providerPricing.create({
      data: { providerId: provider.id, subserviceId: fanInstallation.id, label: "Standard electrical visit", unit: "PER_VISIT", amountMin: 30000, amountMax: 80000 },
    }).catch(() => {});
    await prisma.providerDocument.create({
      data: { providerId: provider.id, type: "ID_PROOF", status: "APPROVED", fileUrl: "private/seed/id-proof.pdf", fileName: "aadhaar.pdf" },
    }).catch(() => {});

    // A sample submitted request from the demo customer, assigned to the provider.
    const existingReq = await prisma.serviceRequest.findFirst({ where: { customerId: customer.id, title: "Ceiling fan installation" } });
    if (!existingReq) {
      const request = await prisma.serviceRequest.create({
        data: {
          customerId: customer.id,
          categoryId: electricalServices.id,
          subserviceId: fanInstallation.id,
          serviceAreaId: vidyanagar.id,
          title: "Ceiling fan installation",
          description: "Need two ceiling fans installed in the living room and bedroom. Wiring is already in place.",
          locality: "Vidyanagar",
          urgency: "WITHIN_WEEK",
          contactPreference: "PHONE",
          budgetMin: 500,
          budgetMax: 1500,
          status: "ASSIGNED",
          statusHistory: {
            create: [
              { fromStatus: null, toStatus: "SUBMITTED", changedById: customer.id, note: "Request submitted by customer" },
              { fromStatus: "SUBMITTED", toStatus: "ASSIGNED", changedById: superAdmin.id, note: "Assigned to Suresh Electricals" },
            ],
          },
        },
      });
      await prisma.providerAssignment.create({
        data: { requestId: request.id, providerId: provider.id, source: "ADMIN", createdById: superAdmin.id, status: "PENDING" },
      });
    }
  }

  // A second provider awaiting verification, so the admin queue isn't empty.
  await prisma.user.upsert({
    where: { email: "pending-provider@example.com" },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: "pending-provider@example.com",
      name: "Lakshmi Cleaning Co",
      role: UserRole.PROVIDER,
      emailVerified: new Date(),
      passwordHash: defaultPasswordHash,
      providerProfile: {
        create: {
          legalName: "Lakshmi Devi",
          displayName: "Lakshmi Cleaning Co",
          publicSlug: "lakshmi-cleaning-co",
          workType: WorkType.TEAM,
          experienceYears: 4,
          languages: ["Kannada", "English"],
          status: ProviderStatus.PENDING_VERIFICATION,
          verificationStatus: VerificationStatus.PENDING,
          completenessScore: 60,
          documents: { create: [{ type: "ID_PROOF", status: "PENDING", fileUrl: "private/seed/lakshmi-id.pdf" }] },
        },
      },
    },
  });

  console.log("Seed complete:", { superAdmin: superAdmin.email, customer: customer.email, provider: providerUser.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
