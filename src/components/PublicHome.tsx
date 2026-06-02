'use client'
import React, { useState } from "react";
import HeroSection from "./HeroSection";
import VehicleSlider from "./VehicleSlider";
import AuthModal from "./AuthModal";
import BookingModal from "./BookingModal";

interface PublicHomeProps {
  onAuthOpen: () => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
}

const PublicHome = ({ onAuthOpen, authOpen, setAuthOpen }: PublicHomeProps) => {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      <HeroSection onBookNow={() => setBookingOpen(true)} />
      <VehicleSlider />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <BookingModal 
        open={bookingOpen} 
        onClose={() => setBookingOpen(false)} 
        onRequireLogin={() => {
          setBookingOpen(false)
          setAuthOpen(true)
        }}
      />
    </>
  );
};

export default PublicHome;
