import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Clock, MapPin, Tag } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { EventGallery } from '@/components/sections/EventGallery';
import { EventRegisterForm } from '@/components/sections/EventRegisterForm';
import { Footer } from '@/components/sections/Footer';
import { EVENTS, getEventBySlug } from '@/lib/events';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

// Turns bare URLs and phone numbers inside a paragraph into clickable links.
const RICH_RE = /(https?:\/\/[^\s]+|\+\d[\d\s]{7,}\d)/g;

function RichText({ text }: { text: string }): ReactNode {
  return text.split(RICH_RE).map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent-gold)] underline underline-offset-2 hover:opacity-80"
        >
          {part}
        </a>
      );
    }
    if (/^\+\d[\d\s]{7,}\d$/.test(part)) {
      return (
        <a key={i} href={`tel:${part.replace(/\s+/g, '')}`} className="text-[var(--accent-gold)] hover:opacity-80">
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function generateStaticParams() {
  return EVENTS.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: 'Event Not Found' };
  return {
    title: event.title,
    description: event.description,
  };
}

function MetaRow({ event }: { event: NonNullable<ReturnType<typeof getEventBySlug>> }) {
  const items = [
    { icon: CalendarDays, label: event.date },
    event.time ? { icon: Clock, label: event.time } : null,
    event.location ? { icon: MapPin, label: event.location } : null,
    event.avenue ? { icon: Tag, label: event.avenue } : null,
  ].filter(Boolean) as { icon: typeof CalendarDays; label: string }[];

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3">
      {items.map(({ icon: Icon, label }) => (
        <span key={label} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Icon className="h-4 w-4 text-[var(--accent-gold)]" />
          {label}
        </span>
      ))}
    </div>
  );
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const isPast = event.type === 'past';
  const hasGallery = isPast && event.gallery && event.gallery.length > 0;

  return (
    <>
      <PageHeader
        eyebrow={isPast ? 'Recap' : 'Upcoming'}
        sanskrit="समय"
        title={event.title}
        subtitle={event.description}
      />

      <div className="mx-auto max-w-4xl px-6 pb-24">
        <ScrollReveal>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-gold)]"
          >
            <ArrowLeft className="h-4 w-4" />
            All events
          </Link>
        </ScrollReveal>

        {event.image && (
          <ScrollReveal>
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={event.image}
                alt={`${event.title} invitation`}
                width={1024}
                height={1280}
                priority
                className="mx-auto h-auto w-full max-w-md"
              />
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <GlassCard className="mt-6 p-8 md:p-12" tilt={false}>
            <MetaRow event={event} />
            <GoldDivider className="my-7" />
            <div className="space-y-4">
              {(event.longDescription ?? [event.description]).map((para, i) => (
                <p key={i} className="leading-relaxed text-[var(--text-secondary)] whitespace-pre-line">
                  <RichText text={para} />
                </p>
              ))}
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* Past → gallery; Upcoming → registration form */}
        {hasGallery ? (
          <>
            <GoldDivider className="my-16" animate />
            <ScrollReveal>
              <h2 className="font-display mb-8 text-3xl font-light text-[var(--text-primary)]">
                Gallery
              </h2>
            </ScrollReveal>
            <EventGallery images={event.gallery!} eventTitle={event.title} />
          </>
        ) : isPast ? (
          <ScrollReveal>
            <GlassCard className="mt-8 p-10 text-center" tilt={false}>
              <p className="text-[var(--text-secondary)]">
                Photos from this event will appear here soon.
              </p>
            </GlassCard>
          </ScrollReveal>
        ) : (
          <>
            <GoldDivider className="my-16" animate />
            <ScrollReveal>
              <h2 className="font-display mb-3 text-3xl font-light text-[var(--text-primary)]">
                Register
              </h2>
              <p className="mb-8 max-w-xl text-[var(--text-secondary)]">
                Reserve your place for {event.title}. We&apos;ll email the final details ahead of the
                day.
              </p>
            </ScrollReveal>
            <ScrollReveal>
              <EventRegisterForm eventTitle={event.title} />
            </ScrollReveal>
          </>
        )}
      </div>

      <Footer />
    </>
  );
}
