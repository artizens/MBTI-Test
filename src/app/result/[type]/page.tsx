import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { personalityTypes } from '@/lib/assessment';
import { SITE_URL } from '@/lib/site';
import Result from '@/features/result';
export const dynamicParams = false;
export function generateStaticParams() {
  return personalityTypes.map((p) => ({ type: p.type }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const p = personalityTypes.find((p) => p.type === type);
  if (!p) return {};
  return {
    title: `${type} · ${p.name} | 결`,
    description: p.summary,
    alternates: { canonical: `${SITE_URL}/result/${type}/` },
    openGraph: {
      title: `${type} — ${p.name}`,
      description: p.summary,
      url: `${SITE_URL}/result/${type}/`,
      images: [
        {
          url: `${SITE_URL}/results/${type}.png`,
          width: 1080,
          height: 1350,
          alt: `${type} ${p.name} 결과 카드`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${type} — ${p.name}`,
      description: p.summary,
      images: [`${SITE_URL}/results/${type}.png`],
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const p = personalityTypes.find((p) => p.type === type);
  if (!p) notFound();
  return <Result profile={p} />;
}
