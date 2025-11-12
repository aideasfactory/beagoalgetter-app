import { useState } from 'react';
import { ChevronRight, Target, TrendingUp, Users } from 'lucide-react';
import { Button } from './ui/button';
import logo from 'figma:asset/ae280b92ceef7e198522f0872d65dd755e21ef9b.png';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OnboardingProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const slides = [
  {
    icon: Target,
    title: 'Create Challenges',
    description: 'Set personal or group goals and track your progress every single day.',
    color: '#00c2ff',
    image: 'https://images.unsplash.com/photo-1596913152332-e56f2cc8165c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwcnVubmluZyUyMHRyYWNrfGVufDF8fHx8MTc2MjQyMTU4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Build streaks, earn ability points, and visualize your journey to success.',
    color: '#00c2ff',
    image: 'https://images.unsplash.com/photo-1620188500179-32ac33c60848?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjB3b3Jrb3V0JTIwdHJhaW5pbmd8ZW58MXx8fHwxNzYyMzE4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    icon: Users,
    title: 'Stay Consistent',
    description: 'Join friends, compete on leaderboards, and celebrate wins together.',
    color: '#00c2ff',
    image: 'https://images.unsplash.com/photo-1710301431051-ee6923af04aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwc3BvcnRzJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYyNDIxNTg1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export default function Onboarding({ onGetStarted, onLogin }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onGetStarted();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen p-6">
        {/* Logo */}
        <div className="">
          <img src={logo} alt="Goal Getter" className="w-40" />
        </div>

        {/* Main Content - Pushed to bottom */}
        <div className="flex-1 flex flex-col justify-end pb-8 max-w-md mx-auto w-full">
          {/* Icon */}
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl backdrop-blur-sm border border-white/20"
            style={{ backgroundColor: `${slide.color}15` }}
          >
            <Icon className="w-10 h-10" style={{ color: slide.color }} />
          </div>
          
          {/* Text Content Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
            <h1 className="text-white mb-3">{slide.title}</h1>
            <p className="text-white/70 leading-relaxed">{slide.description}</p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            {/* Dots */}
            <div className="flex justify-center gap-2 mb-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'w-8' 
                      : 'w-2 bg-white/30'
                  }`}
                  style={index === currentSlide ? { backgroundColor: '#00c2ff' } : {}}
                />
              ))}
            </div>

            {/* Get Started / Next Button */}
            <Button 
              onClick={nextSlide}
              className="w-full text-black py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: '#00c2ff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
            >
              <span className="flex items-center justify-center gap-2">
                {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </span>
            </Button>

            {/* Login Link */}
            <button
              onClick={onLogin}
              className="w-full text-white/60 hover:text-white transition-colors text-center py-2"
            >
              Already have an account?{' '}
              <span style={{ color: '#00c2ff' }} className="hover:underline">
                Log in
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
