import { useEffect, useRef, useState } from "react";

/**
 * useInViewOnce - native IntersectionObserver, trigger sekali saja
 * (unobserve setelah masuk viewport pertama kali). Dipakai untuk
 * unlock-reveal animation di Experience/Achievement/Project card.
 *
 * Usage:
 *   const { ref, inView } = useInViewOnce({ threshold: 0.2 });
 *   <article ref={ref} className={inView ? "unlocked" : "pending"}>...</article>
 */
export function useInViewOnce({ threshold = 0.2, rootMargin = "0px" } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, inView]);

  return { ref, inView };
}
