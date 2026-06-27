import StaticPageView from "@/components/StaticPageView";
export const dynamic = "force-dynamic";
export default function Page() {
  return <StaticPageView slug="terms" fallbackTitle="Terms of Service" />;
}
