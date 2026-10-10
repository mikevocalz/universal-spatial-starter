import { cacheLife } from 'next/cache';
import { ShowcaseScreen, SHOWCASE_DEMOS, type ShowcaseDemo } from '@acme/app';

// Serializable gallery data lives in the RSC payload, not the client bundle:
// cached at the longest lifetime since the demo list only changes on deploy.
async function loadDemos(): Promise<readonly ShowcaseDemo[]> {
  'use cache';
  cacheLife('max');
  return SHOWCASE_DEMOS;
}

export default async function Page() {
  return <ShowcaseScreen demos={await loadDemos()} />;
}
