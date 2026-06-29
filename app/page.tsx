import { HomeClient } from "./HomeClient";
import { loadSiteContent } from "./lib/siteContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await loadSiteContent();

  return <HomeClient content={content} />;
}
