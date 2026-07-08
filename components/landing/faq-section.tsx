'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Is FindBack free to use?',
    answer: 'Yes! FindBack is completely free for basic features. You can report lost items, search for found items, and connect with finders at no cost. Premium features may be available for advanced matching and priority listings.',
  },
  {
    question: 'How does the matching system work?',
    answer: 'Our smart matching algorithm compares your lost item description with found items in our database. It considers factors like item type, color, brand, location, and date to find the most relevant matches.',
  },
  {
    question: 'How do I verify ownership of a lost item?',
    answer: 'When someone claims your found item, they\'ll need to provide proof of ownership. This could include photos of them with the item, receipts, unique identifiers, or answers to specific questions about the item.',
  },
  {
    question: 'Is my personal information safe?',
    answer: 'Absolutely. We take privacy seriously. Your contact information is only shared when you choose to connect with someone. Our messaging system keeps your email and phone number private until you\'re ready to share.',
  },
  {
    question: 'What if someone claims my item falsely?',
    answer: 'We have a verification process and dispute resolution system. Both parties can provide evidence, and our moderators can step in if needed. Our reputation system also helps identify trustworthy users.',
  },
  {
    question: 'Can I use FindBack anywhere in the world?',
    answer: 'Yes! FindBack works globally. Simply set your location when reporting or searching for items. The platform automatically shows relevant results from your area or any location you specify.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-sm font-medium mx-auto">
            <HelpCircle className="h-4 w-4" />
            Got questions?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Everything you need to know about FindBack.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left"
              >
                <div className="bg-card rounded-xl border p-4 hover:border-teal-500/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                        openIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 text-muted-foreground">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
