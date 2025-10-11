import React from 'react';
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-black text-white border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Contact Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <a href="tel:+918047307182" className="hover:text-primary transition-colors text-white">
              +91-8047307182
            </a>
          </div>
          
          {/* Email */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <a href="mailto:vrundavan.solutions@gmail.com" className="hover:text-primary transition-colors text-white truncate">
              vrundavan.solutions@gmail.com
            </a>
          </div>
          
          {/* Address */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-wrap text-white">GF-1 Durga Heights, New Manjalpur, Vadodara</span>
          </div>
          
          {/* Copyright */}
          <div className="text-xs text-white flex items-center lg:justify-end">
            © {new Date().getFullYear()} Aswin Prajapati
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;