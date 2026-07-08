'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'New York, USA',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100',
    rating: 5,
    text: 'I lost my wedding ring at the park and thought it was gone forever. Within 2 days, someone found it through LoFi. I\'m so grateful!',
  },
  {
    name: 'Michael Chen',
    location: 'Toronto, Canada',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=100',
    rating: 5,
    text: 'This platform is amazing! I found a lost laptop and was able to return it to the owner. The matching system made it so easy.',
  },
  {
    name: 'Emma Williams',
    location: 'London, UK',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
    rating: 5,
    text: 'Lost my passport while traveling. LoFi helped me connect with someone who found it. Best service ever!',
  },
  {
    name: 'David Kim',
    location: 'Seoul, Korea',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
    rating: 5,
    text: 'The reputation system gives me confidence when interacting with others. It\'s a trustworthy community.',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">Success Stories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real stories from real people who found their lost items through LoFi.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-card rounded-2xl p-6 shadow-lg border h-full">
                <Quote className="h-8 w-8 text-teal-500/20 mb-4" />

                <p className="text-foreground mb-6">{testimonial.text}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-teal-100 text-teal-700">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>

                  <div className="flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
