'use client';

import { useState } from 'react';
import { Mail, CircleCheck as CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function HomeNewsletter() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, name });

    if (dbError) {
      setLoading(false);
      if (dbError.code === '23505') {
        setError('This email is already subscribed!');
      } else {
        setError('Something went wrong. Please try again.');
      }
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-newsletter-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, name }),
        }
      );
      if (!res.ok) {
        console.error('Email notification failed:', res.status);
      }
    } catch (emailErr) {
      console.error('Email notification error:', emailErr);
    }

    setLoading(false);
    setSuccess(true);
    setEmail('');
    setName('');
  };

  return (
    <section className="py-16 bg-white border-t border-cream-100" aria-labelledby="newsletter-heading">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-12 h-12 bg-golden-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5 text-golden-600" />
        </div>
        <h2
          id="newsletter-heading"
          className="font-poppins font-700 text-2xl md:text-3xl text-forest-500 mb-3"
        >
          Stay Connected with Our Community
        </h2>
        <p className="text-muted-gray font-inter text-base leading-relaxed mb-8">
          Subscribe to receive our monthly newsletter with devotionals, program updates,
          upcoming events, and encouragement for your family.
        </p>

        {success ? (
          <div className="flex items-center justify-center gap-3 bg-sage-100 text-sage-500 rounded-2xl px-6 py-5">
            <CheckCircle className="w-5 h-5" />
            <div className="text-left">
              <p className="font-poppins font-600 text-forest-500 text-sm">You&apos;re subscribed!</p>
              <p className="text-muted-gray font-inter text-xs mt-0.5">
                Thank you for joining our community. You&apos;ll hear from us soon.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-[14px] border border-cream-100 bg-cream font-inter text-sm text-charcoal placeholder:text-muted-gray focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-[14px] border border-cream-100 bg-cream font-inter text-sm text-charcoal placeholder:text-muted-gray focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        {error && (
          <p className="text-red-500 text-sm font-inter mt-3">{error}</p>
        )}

        <p className="text-muted-gray text-xs font-inter mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
