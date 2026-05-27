"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { FaWhatsapp, FaPhone } from "react-icons/fa";

const slides = [
  {
    id: 1,
    image: "/hero/hero-slide-1-emergency.jpg",
    title: "24/7 Emergency Ambulance Service",
    subtitle: "Professional medical transport across Southern Sri Lanka",
    primaryCTA: {
      text: "Call Now: 077 282 6946",
      href: "tel:+94772826946",
      icon: FaPhone,
    },
    secondaryCTA: {
      text: "WhatsApp Us",
      href: "https://wa.me/94772826946",
      icon: FaWhatsapp,
    },
  },
  {
    id: 2,
    image: "/hero/hero-slide-2-patient-care.jpg",
    title: "Swift & Safe Patient Transport",
    subtitle: "Equipped ambulances with trained paramedics for your safety",
    primaryCTA: {
      text: "Book a Transfer",
      href: "/contact",
      icon: null,
    },
    secondaryCTA: {
      text: "Our Services",
      href: "/services",
      icon: null,
    },
  },
  {
    id: 3,
    image: "/hero/hero-slide-3-training.jpg",
    title: "First Aid Training & Event Medical Cover",
    subtitle: "Comprehensive emergency medical support for your organization",
    primaryCTA: {
      text: "Get a Quote",
      href: "/contact",
      icon: null,
    },
    secondaryCTA: {
      text: "Learn More",
      href: "/services#training",
      icon: null,
    },
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden mt-20 lg:mt-24">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              className="object-cover object-center"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className="max-w-3xl text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-100">{slide.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Primary CTA */}
                <a
                  href={slide.primaryCTA.href}
                  className="inline-flex items-center justify-center space-x-2 bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  {slide.primaryCTA.icon && <slide.primaryCTA.icon className="text-xl" />}
                  <span>{slide.primaryCTA.text}</span>
                </a>
                {/* Secondary CTA */}
                <a
                  href={slide.secondaryCTA.href}
                  className="inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border-2 border-white"
                >
                  {slide.secondaryCTA.icon && <slide.secondaryCTA.icon className="text-xl" />}
                  <span>{slide.secondaryCTA.text}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
        aria-label="Previous slide"
      >
        <HiChevronLeft className="text-3xl" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all z-10"
        aria-label="Next slide"
      >
        <HiChevronRight className="text-3xl" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
