'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Camera,
  Shield,
  Bell,
  MessageSquare,
  Globe,
  Award,
  Smartphone,
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Location-Based Search',
    description: 'Find items near you with precise location filtering and map integration.',
  },
  {
    icon: Camera,
    title: 'Photo Verification',
    description: 'Upload photos of your lost items to help others identify and match them accurately.',
  },
  {
    icon: Shield,
    title: 'Secure Messaging',
    description: 'Communicate safely with finders through our encrypted messaging system.',
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    description: 'Get notified immediately when a potential match is found for your lost item.',
  },
  {
    icon: MessageSquare,
    title: 'Community Support',
    description: 'Join a helpful community of users who look out for each other\'s belongings.',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Access a worldwide network of finders to locate items lost anywhere.',
  },
  {
    icon: Award,
    title: 'Reputation System',
    description: 'Build trust through our reputation system that rewards helpful community members.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    description: 'Access FindBack on any device with our responsive design and mobile app.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to find your lost items and help others do the same.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <div className="bg-card rounded-xl p-6 border hover:shadow-lg transition-all duration-300 h-full hover:border-teal-500/50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 flex items-center justify-center mb-4 group-hover:from-teal-500 group-hover:to-emerald-600 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
