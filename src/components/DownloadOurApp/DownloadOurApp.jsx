"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGlobalContext } from '../Context';

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.jayempire.pax26mobile";

const DownloadOurApp = () => {
  const { pax26 } = useGlobalContext();
  return (
    <section
      id="downloadApp"
      className="py-14 px-6"
      style={{ backgroundColor: pax26?.secondaryBg }}
    >
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">

        <div>
          <h2 className="text-2xl font-black mb-2" style={{ color: pax26?.textPrimary, letterSpacing: '-0.03em' }}>
            Manage your store on the go
          </h2>
          <p className="text-sm" style={{ color: pax26?.textSecondary, lineHeight: 1.7 }}>
            Get the Pax26 mobile app — track orders, reply to customers,
            view sales and manage your AI agent from your phone.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* Google Play — live */}
          <Link
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:-translate-y-0.5"
          >
            <Image
              src="/playstore.webp"
              alt="Download on Google Play"
              width={148}
              height={44}
              className="rounded-xl"
              style={{ height: '44px', width: 'auto' }}
            />
          </Link>

          {/* App Store — coming soon, not clickable */}
          <div
            className="relative cursor-not-allowed select-none"
            title="iOS app coming soon"
          >
            <Image
              src="/apple-store.png"
              alt="Download on the App Store — Coming Soon"
              width={148}
              height={44}
              className="rounded-xl"
              style={{ height: '44px', width: 'auto', opacity: 0.4, filter: 'grayscale(0.4)' }}
            />
            <span
              className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-md text-white font-black"
              style={{ fontSize: '8px', background: '#6366f1', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              Soon
            </span>
          </div>
        </div>

        <p className="text-xs" style={{ color: pax26?.textSecondary, opacity: 0.5 }}>
          Android v1.2 available now &nbsp;·&nbsp; iOS coming soon
        </p>

      </div>
    </section>
  );
};

export default DownloadOurApp;
