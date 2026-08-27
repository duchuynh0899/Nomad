"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types/api";

const AUTOPLAY_INTERVAL_MS = 5000;

export function HeroBannerCarousel({ banners }: { banners: Banner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || banners.length < 2) return;
    const id = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [emblaApi, banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="relative mb-10 overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {banners.map((banner, idx) => (
          <Link
            key={banner._id}
            href={banner.href || "/shop"}
            className="relative min-w-0 flex-[0_0_100%] block h-[60vh] min-h-[420px]"
          >
            <Image
              src={banner.url}
              alt=""
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover"
            />
          </Link>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-2">
          {banners.map((banner, idx) => (
            <button
              key={banner._id}
              onClick={() => emblaApi?.scrollTo(idx)}
              aria-label={`Banner ${idx + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === selectedIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
