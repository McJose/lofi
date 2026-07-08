'use client';

import { motion } from 'framer-motion';
import { Search, ListChecks, Handshake } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Report or Search',
    description: 'Report a lost item with details and photos, or search through found items to locate your belongings.',
    color: 'from-teal-500 to-tea l-600',
  },
  {
    icon: ListChecks,
    title: 'Get Matched',
    description: 'Our smart matching system connects you with potential matches based on descriptions and locations.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Handshake,
    title: 'Reunite',
    description: 'Connect with the finder, verify ownership details, and arrange a safe meetup to recover your item.',
    color: 'from-cyan-500 to-cyan-600',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to reunite with your lost belongings or help others find theirs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-8 shadow-lg border h-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6`}>
                  <step.icon className="h-7 w-7 text-white" />
                </div>

                <div className="absolute top-4 right-4 text-6xl font-bold text-muted-foreground/10">
                  {index + 1}
                </div>

                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
