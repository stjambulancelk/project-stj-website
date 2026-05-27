"use client";

import type { Metadata } from "next";
import { useState } from "react";
import Image from "next/image";

// Gallery data organized by category
const galleryData = {
  fleet: [
    { src: "/fleet/Ambulance-Van-1.jpg", alt: "STJ Southern Ambulance Vehicle", category: "fleet" },
    { src: "/fleet/Ambulance-Three-vans.jpg", alt: "STJ Ambulance Fleet", category: "fleet" },
  ],
  airportTransfers: [
    { src: "/air-port/air-port.jpg", alt: "Airport medical transfer service", category: "airportTransfers" },
    { src: "/air-port/air-port-1.jpg", alt: "Airport ambulance service", category: "airportTransfers" },
    { src: "/air-port/air-port-2.jpg", alt: "Medical airport transport", category: "airportTransfers" },
  ],
  patientCare: [
    { src: "/patient-care/Treating-Patients-1.jpg", alt: "Patient care service", category: "patientCare" },
    { src: "/patient-care/Sports-event---firstaid-team-support.jpg", alt: "Medical support", category: "patientCare" },
    { src: "/patient-care/1st-aid-traning-for-school-children-1.jpg", alt: "First aid demonstration", category: "patientCare" },
  ],
  training: [
    { src: "/training/training.jpg", alt: "First aid training session", category: "training" },
    { src: "/training/training-1.jpg", alt: "Training program", category: "training" },
    { src: "/training/training-3.jpg", alt: "School first aid training", category: "training" },
    { src: "/training/training-4.jpg", alt: "Practical first aid training", category: "training" },
    { src: "/training/training-5.jpg", alt: "CPR training", category: "training" },
    { src: "/training/training-6.jpg", alt: "First aid course", category: "training" },
    { src: "/training/training-7.jpg", alt: "Medical training session", category: "training" },
    { src: "/training/training-8.jpg", alt: "Student training program", category: "training" },
    { src: "/training/training-9.jpg", alt: "Community first aid training", category: "training" },
    { src: "/training/training-10.jpg", alt: "First aid camp", category: "training" },
  ],
  events: [
    { src: "/events/events.jpg", alt: "Sports event medical support", category: "events" },
    { src: "/events/events-1.jpg", alt: "Event ambulance cover", category: "events" },
    { src: "/events/events-2.jpg", alt: "Marathon medical support", category: "events" },
    { src: "/events/events-4.jpg", alt: "Event first aid team", category: "events" },
  ],
  medicalCamps: [
    { src: "/medical-camps/medical-camps.jpg", alt: "Community medical camp", category: "medicalCamps" },
    { src: "/medical-camps/medical-camps-1.jpg", alt: "Free health screening camp", category: "medicalCamps" },
  ],
  communityService: [
    { src: "/community-service/community-service.jpg", alt: "Dansala CSR activity", category: "communityService" },
    { src: "/community-service/community-service-1.jpg", alt: "Community service", category: "communityService" },
  ],
  team: [
    { src: "/team/Team.jpg", alt: "STJ Southern Ambulance Team", category: "team" },
  ],
};

// Flatten all images
const allImages = [
  ...galleryData.fleet,
  ...galleryData.airportTransfers,
  ...galleryData.patientCare,
  ...galleryData.training,
  ...galleryData.events,
  ...galleryData.medicalCamps,
  ...galleryData.communityService,
  ...galleryData.team,
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const categories = [
    { id: "all", name: "All Photos", count: allImages.length },
    { id: "fleet", name: "Our Fleet", count: galleryData.fleet.length },
    { id: "airportTransfers", name: "Airport Transfers", count: galleryData.airportTransfers.length },
    { id: "patientCare", name: "Patient Care", count: galleryData.patientCare.length },
    { id: "training", name: "Training", count: galleryData.training.length },
    { id: "events", name: "Events", count: galleryData.events.length },
    { id: "medicalCamps", name: "Medical Camps", count: galleryData.medicalCamps.length },
    { id: "communityService", name: "Community Service", count: galleryData.communityService.length },
    { id: "team", name: "Team", count: galleryData.team.length },
  ];

  const filteredImages =
    selectedCategory === "all"
      ? allImages
      : allImages.filter((img) => img.category === selectedCategory);

  return (
    <div className="mt-20 lg:mt-24">
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Gallery</h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
            See our team in action serving the Southern community
          </p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 bg-gray-50 sticky top-20 lg:top-24 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                } shadow-sm`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <div
                key={index}
                className="relative h-64 rounded-lg overflow-hidden shadow-lg cursor-pointer group"
                onClick={() => setLightboxImage(image.src)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full">
            <Image
              src={lightboxImage}
              alt="Gallery image"
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
