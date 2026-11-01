import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import PreservationPrinciples from '../components/PreservationPrinciples';

export default function LandingPage({ onOpenWorkspace }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-0">
      <Hero
        onOpenWorkspace={onOpenWorkspace}
        onLearnMore={() => scrollToSection('how-it-works')}
      />
      <HowItWorks />
      <PreservationPrinciples />
    </div>
  );
}
