import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ResultsReveal = ({ children, triggerId }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const answers = el.querySelectorAll('.reveal-answer');
    const triggerElem = triggerId ? document.getElementById(triggerId) : el;
    gsap.fromTo(
      answers,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: triggerElem,
          start: 'top 80%',
          end: 'bottom 60%',
          toggleActions: 'play none none reverse',
        },
      }
    );
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [triggerId]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

export default ResultsReveal; 