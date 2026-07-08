'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '50K+', label: 'Items reunited', suffix: '' },
  { value: '10K+', label: 'Active users', suffix: '' },
  { value: '98%', label: 'Success rate', suffix: '' },
  { value: '24', label: 'Countries', suffix: '' },
];

export function StatsSection() {
  return (
    <section className="py-16 border-y bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent">
                {stat.value}
                {stat.suffix}
              </p>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
