/** Single source of truth shared by seed, UI, and validators. */

export const BRAND = {
  name: "Cloud AIF",
  city: "Shivamogga",
  state: "Karnataka",
  tagline: "Verified local pros for your home, beauty, and learning needs.",
} as const;

export const COLORS = {
  forest: "#1B4332",
  green: "#2D6A4F",
  emerald: "#40916C",
  sage: "#95D5B2",
  mist: "#D8F3DC",
  ink: "#1A1A1A",
  slate: "#5B6660",
  line: "#E4EAE6",
} as const;

export type CategoryDef = { name: string; slug: string; icon: string; blurb: string; subs: string[] };

export const CATEGORIES: CategoryDef[] = [
  {
    name: "Home Repair & Handyman",
    slug: "home-repair-handyman",
    icon: "wrench",
    blurb: "Electricians, plumbers, carpenters and quick fixes.",
    subs: ["Electrician", "Plumber", "Carpenter", "Fan & Light Installation", "Switchboard Repair", "Appliance Repair", "Door Lock / Minor Fittings"],
  },
  {
    name: "Cleaning & Pest Control",
    slug: "cleaning-pest-control",
    icon: "sparkles",
    blurb: "Deep cleaning, sofa care and pest control.",
    subs: ["Bathroom Cleaning", "Kitchen Cleaning", "Full Home Cleaning", "Sofa Cleaning", "Pest Control", "Water Tank Cleaning"],
  },
  {
    name: "Painting & Home Improvement",
    slug: "painting-home-improvement",
    icon: "roller",
    blurb: "Painting, waterproofing and small renovations.",
    subs: ["Room Painting", "Wall Repair", "Waterproofing", "Minor Civil Work", "Furniture Polish", "Small Renovation Help"],
  },
  {
    name: "Salon, Spa & Beauty",
    slug: "salon-spa-beauty",
    icon: "scissors",
    blurb: "At-home styling, facials, bridal makeup and spa.",
    subs: ["Haircut / Styling", "Facial", "Waxing", "Manicure / Pedicure", "Bridal Makeup", "Massage / Spa"],
  },
  {
    name: "Education, Tutoring & Coaching",
    slug: "education-tutoring-coaching",
    icon: "book",
    blurb: "Tuition, exam coaching, languages and skills.",
    subs: ["Home Tuition", "Exam Coaching", "Spoken English", "Coding Classes", "Music / Dance Classes", "Subject Tutoring"],
  },
];

export const SHIVAMOGGA_LOCALITIES = [
  "Vidyanagar", "Gandhi Bazaar", "Durgigudi", "Basaveshwara Nagar", "Nehru Road",
  "Shankaraghatta", "Vinoba Nagar", "Sagar Road", "B.H. Road", "Ashoka Road", "Jayanagar", "Kuvempu Nagar",
];

export const ROUTES = {
  public: ["/", "/services", "/how-it-works", "/become-a-provider", "/support", "/faq", "/privacy", "/terms"],
  provider: ["/provider", "/provider/profile", "/provider/services", "/provider/availability", "/provider/portfolio", "/provider/requests", "/provider/reviews", "/provider/settings", "/provider/verification-status"],
  admin: ["/admin", "/admin/providers", "/admin/requests", "/admin/categories", "/admin/subservices", "/admin/reviews", "/admin/complaints", "/admin/users", "/admin/settings", "/admin/audit-logs"],
} as const;
