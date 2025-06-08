import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Home Chef & Food Blogger',
    image: '/api/placeholder/80/80',
    content:
      'RecipeShare has transformed how I organize and share my recipes. The interface is so intuitive, and I love how my friends can easily rate and comment on dishes.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Mike Johnson',
    role: 'Weekend Cook',
    image: '/api/placeholder/80/80',
    content:
      "I never thought I'd be sharing recipes online, but RecipeShare makes it so easy. Now our friend group has a whole collection of tried-and-tested favorites!",
    rating: 5,
  },
  {
    id: 3,
    name: 'Emma Wilson',
    role: 'Baking Enthusiast',
    image: '/api/placeholder/80/80',
    content:
      'The recipe editor is fantastic for my detailed baking instructions. My friends can follow along step-by-step, and the results are always perfect.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Alex Rodriguez',
    role: 'Healthy Living Advocate',
    image: '/api/placeholder/80/80',
    content:
      "Finding healthy recipes that actually taste good used to be a challenge. Now I have access to all my friends' nutritious and delicious creations in one place.",
    rating: 5,
  },
];

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <Card className="h-full border border-gray-100 bg-white shadow-md transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Quote className="text-primary/20 mt-1 h-8 w-8 flex-shrink-0" />
          <div className="flex-1">
            <p className="mb-4 leading-relaxed text-gray-700">
              &ldquo;{testimonial.content}&rdquo;
            </p>

            <div className="mb-4 flex items-center gap-1">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {testimonial.name}
                </h4>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-white py-16">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            What Our Community Says
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Real feedback from real home cooks who use RecipeShare every day
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
