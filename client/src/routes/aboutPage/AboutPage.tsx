import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './aboutPage.scss';

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function useCountUp(target: number, duration = 1800, triggered = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!triggered) return;
    let startTime: number | null = null;
    let raf: number;

    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [triggered, target, duration]);

  return count;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HEADLINE_WORDS = ['We', 'believe', 'home', 'is', 'more', 'than', 'a', 'place.'];

const STATS = [
  { value: 2400, suffix: '+', label: 'Active Listings' },
  { value: 48,   suffix: '',  label: 'Cities Covered'  },
  { value: 15000, suffix: '+', label: 'Happy Users'    },
  { value: 98,   suffix: '%', label: 'Satisfaction'    },
];

const VALUES = [
  {
    num: '01',
    title: 'Curated Quality',
    body: 'Every listing is reviewed before it goes live. No duplicates, no ghosts, no bait-and-switch. Just real properties from verified owners.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Radical Transparency',
    body: 'Every price shown is the real price. Full details, honest photos, zero hidden fees. We believe informed decisions are better decisions.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" stroke="currentColor"/>
        <path d="M12 8v4l3 3" stroke="currentColor" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Real Connections',
    body: 'Chat directly with verified owners. No middlemen, no spam, no cold calls. Just honest conversations between real people.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const TEAM = [
  { name: 'Aleksandra M.', role: 'Co-Founder & CEO', fun: 'Former architect who built apps instead of buildings.', initials: 'AM' },
  { name: 'Piotr K.',      role: 'Co-Founder & CTO', fun: 'Wrote the first line of code on a train to Kraków.',   initials: 'PK' },
  { name: 'Natalia W.',    role: 'Head of Design',    fun: 'Obsessed with typography and good espresso.',           initials: 'NW' },
  { name: 'Marcin B.',     role: 'Head of Growth',    fun: 'Has visited every city we list in. Twice.',            initials: 'MB' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatItem: React.FC<{ stat: typeof STATS[0]; triggered: boolean }> = ({ stat, triggered }) => {
  const count = useCountUp(stat.value, 1800, triggered);
  return (
    <div className="about-stats__item">
      <span className="about-stats__number">
        {count.toLocaleString()}{stat.suffix}
      </span>
      <span className="about-stats__label">{stat.label}</span>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const AboutPage: React.FC = () => {
  const missionSection = useInView(0.2);
  const statsSection   = useInView(0.3);
  const valuesSection  = useInView(0.1);
  const teamSection    = useInView(0.1);

  // floating shapes ref for subtle parallax on scroll
  const heroRef = useRef<HTMLElement>(null);
  const handleScroll = useCallback(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const y = window.scrollY;
    const shapes = hero.querySelector<HTMLElement>('.about-hero__shapes');
    if (shapes) shapes.style.transform = `translateY(${y * 0.18}px)`;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="about">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="about-hero" ref={heroRef}>
        <div className="about-hero__shapes" aria-hidden>
          <div className="about-hero__shape about-hero__shape--1" />
          <div className="about-hero__shape about-hero__shape--2" />
          <div className="about-hero__shape about-hero__shape--3" />
          <div className="about-hero__dots" />
        </div>

        <span className="about-hero__watermark" aria-hidden>HOME</span>

        <div className="about-hero__content">
          <p className="about-hero__eyebrow">
            <span className="about-hero__eyebrow-line" />
            EST. 2024 — OUR STORY
            <span className="about-hero__eyebrow-line" />
          </p>

          <h1 className="about-hero__headline">
            {HEADLINE_WORDS.map((word, i) => (
              <span
                key={i}
                className="about-hero__word"
                style={{ animationDelay: `${0.3 + i * 0.07}s` }}
              >
                {word}
              </span>
            ))}
          </h1>

          <p className="about-hero__sub">
            majkelovsky was built by people who got tired of blurry photos,
            hidden fees, and impossible-to-reach landlords. We set out to
            create the marketplace we always wished existed.
          </p>

          <div className="about-hero__actions">
            <Link to="/listings" className="about-hero__cta">
              Browse Listings
            </Link>
            <a href="#values" className="about-hero__ghost">
              Our Values
              <svg viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="about-hero__scroll-hint" aria-hidden>
          <div className="about-hero__mouse">
            <div className="about-hero__wheel" />
          </div>
        </div>
      </section>

      {/* ── MISSION ───────────────────────────────────────────────────────── */}
      <section
        className={`about-mission${missionSection.inView ? ' is-visible' : ''}`}
        ref={missionSection.ref}
      >
        <div className="about-mission__inner">
          <div className="about-mission__rule" />
          <p className="about-mission__eyebrow">Our Mission</p>
          <blockquote className="about-mission__quote">
            "Real estate is more than walls and windows.
            <br />It's where life&nbsp;happens."
          </blockquote>
          <p className="about-mission__body">
            We started majkelovsky because the process of finding a home
            was broken. We rebuilt it from scratch — with honesty, design,
            and technology at the core. Every feature on this platform
            exists to make your search faster, clearer, and more human.
          </p>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section
        className={`about-stats${statsSection.inView ? ' is-visible' : ''}`}
        ref={statsSection.ref}
      >
        <div className="about-stats__inner">
          {STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} triggered={statsSection.inView} />
          ))}
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────────────── */}
      <section
        id="values"
        className={`about-values${valuesSection.inView ? ' is-visible' : ''}`}
        ref={valuesSection.ref}
      >
        <div className="about-values__header">
          <p className="about-values__eyebrow">Why Choose Us</p>
          <h2 className="about-values__heading">Built Different.</h2>
        </div>

        <div className="about-values__grid">
          {VALUES.map((v, i) => (
            <div
              key={v.num}
              className="about-values__card"
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <span className="about-values__num">{v.num}</span>
              <div className="about-values__icon">{v.icon}</div>
              <h3 className="about-values__title">{v.title}</h3>
              <p className="about-values__body">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────────────────────── */}
      <section
        className={`about-team${teamSection.inView ? ' is-visible' : ''}`}
        ref={teamSection.ref}
      >
        <div className="about-team__header">
          <p className="about-team__eyebrow">The People</p>
          <h2 className="about-team__heading">Built by humans,<br/>for humans.</h2>
        </div>

        <div className="about-team__grid">
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              className="about-team__card"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="about-team__avatar">
                {member.initials}
              </div>
              <div className="about-team__info">
                <span className="about-team__name">{member.name}</span>
                <span className="about-team__role">{member.role}</span>
              </div>
              <p className="about-team__fun">{member.fun}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="about-cta">
        <div className="about-cta__bg" aria-hidden />
        <div className="about-cta__content">
          <p className="about-cta__eyebrow">Start exploring</p>
          <h2 className="about-cta__heading">
            Ready to find<br/>
            <em>your</em> place?
          </h2>
          <p className="about-cta__sub">
            No account needed to browse. Just open the map and start exploring.
          </p>
          <Link to="/listings" className="about-cta__btn">
            Browse All Listings
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
