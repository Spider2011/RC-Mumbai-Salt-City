import type { MetadataRoute } from 'next';
import { NAV_LINKS, SITE } from '@/lib/constants';
import { EVENTS } from '@/lib/events';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = NAV_LINKS.map(({ href }) => ({
    url: new URL(href, SITE.url).toString(),
    priority: href === '/' ? 1 : 0.8,
  }));

  const events = EVENTS.map((event) => ({
    url: new URL(`/events/${event.slug}`, SITE.url).toString(),
    priority: 0.6,
  }));

  return [...pages, ...events];
}
