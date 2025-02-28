import { DraftModeScript } from '@makeswift/runtime/next/server';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { clsx } from 'clsx';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { PropsWithChildren } from 'react';

import '../globals.css';

import { fonts } from '~/app/fonts';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { routing } from '~/i18n/routing';
import { SiteTheme } from '~/lib/makeswift/components/site-theme';
import { MakeswiftProvider } from '~/lib/makeswift/provider';

import { getToastNotification } from '../../lib/server-toast';
import { CookieNotifications, Notifications } from '../notifications';
import { Providers } from '../providers';

import '~/lib/makeswift/components';

const RootLayoutMetadataQuery = graphql(`
  query RootLayoutMetadataQuery {
    site {
      settings {
        storeName
        seo {
          pageTitle
          metaDescription
          metaKeywords
        }
      }
    }
  }
`);

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await client.fetch({
    document: RootLayoutMetadataQuery,
    fetchOptions: { next: { revalidate } },
  });

  const storeName = data.site.settings?.storeName ?? '';

  const { pageTitle, metaDescription, metaKeywords } = data.site.settings?.seo || {};

  return {
    title: {
      template: `%s - ${storeName}`,
      default: pageTitle || storeName,
    },
    icons: {
      icon: '/favicon.ico', // app/favicon.ico/route.ts
    },
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
    other: {
      platform: 'bigcommerce.catalyst',
      build_sha: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? '',
    },
  };
}

const VercelComponents = () => {
  if (process.env.VERCEL !== '1') {
    return null;
  }

  return (
    <>
      {process.env.DISABLE_VERCEL_ANALYTICS !== 'true' && <Analytics />}
      {process.env.DISABLE_VERCEL_SPEED_INSIGHTS !== 'true' && <SpeedInsights />}
    </>
  );
};

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ params, children }: Props) {
  const { locale } = await params;
  const toastNotificationCookieData = await getToastNotification();

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  // need to call this method everywhere where static rendering is enabled
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router#add-setRequestLocale-to-all-layouts-and-pages
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <MakeswiftProvider previewMode={(await draftMode()).isEnabled}>
      <html className={clsx(fonts.map((f) => f.variable))} lang={locale}>
        <head>
          <SiteTheme />
          <DraftModeScript appOrigin={process.env.MAKESWIFT_APP_ORIGIN} />
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-LNXRR0HVZ2"></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LNXRR0HVZ2');
            `,
          }}></script>
          <script async src="https://www.googletagmanager.com/gtag/js?id=AW-880721874"></script>
          <script dangerouslySetInnerHTML={{
            __html: `
               window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-880721874');
            `,
          }}></script>
          <script dangerouslySetInnerHTML={{
            __html: `
               (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"5668971", enableAutoSpaTracking: true};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");
            `,
          }}></script>
        </head>
        <body>
          <Notifications />
          <NextIntlClientProvider locale={locale} messages={messages}>
            <NuqsAdapter>
              <Providers>
                {toastNotificationCookieData && (
                  <CookieNotifications {...toastNotificationCookieData} />
                )}
                {children}
              </Providers>
            </NuqsAdapter>
          </NextIntlClientProvider>
          <VercelComponents />
        </body>
      </html>
    </MakeswiftProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const fetchCache = 'default-cache';
