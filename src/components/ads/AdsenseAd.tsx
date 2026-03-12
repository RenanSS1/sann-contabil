import { useEffect, useRef, useState } from 'react';
import { ADSENSE_CONFIG } from '../../config/adsenseConfig';

type Props = {
  slot: string;
  format?: string;
  responsive?: boolean;
  style?: React.CSSProperties;
};

export const AdsenseAd = ({ slot, format = 'auto', responsive = true, style }: Props) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const isDev = /aistudio|localhost|dev/.test(window.location.hostname);
    if (isDev) return; // Don't load AdSense in dev

    if (isVisible && ADSENSE_CONFIG.enabled) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [isVisible]);

  return (
    <div ref={adRef} style={{ minHeight: '100px', ...style }}>
      {isVisible && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', ...style }}
          data-ad-client={ADSENSE_CONFIG.publisherId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      )}
    </div>
  );
};
