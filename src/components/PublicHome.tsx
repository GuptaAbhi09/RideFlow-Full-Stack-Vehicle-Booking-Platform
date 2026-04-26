'use client'
import React from "react";
import HeroSection from "./HeroSection";
import VehicleSlider from "./VehicleSlider";
import AuthModal from "./AuthModal";

interface PublicHomeProps {
  onAuthOpen: () => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
}

const PublicHome = ({ onAuthOpen, authOpen, setAuthOpen }: PublicHomeProps) => {
  return (
    <>
      <HeroSection onBookNow={onAuthOpen} />
      <VehicleSlider />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default PublicHome;
