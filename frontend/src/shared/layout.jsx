import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, MapPin } from "lucide-react";
import { Button, Input } from "./ui";
import imgLogo from "../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png";

export function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={imgLogo} alt="Annaya" className="h-12 w-auto" />
          </Link>
          <div className="relative hidden max-w-xl flex-1 md:flex">
            <Input placeholder="Search restaurants, cuisines, or dishes..." className="pr-10 h-11" />
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#F97316]" />
              <span className="text-sm">Set Location</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/orders')}><ShoppingCart className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}><User className="h-5 w-5" /></Button>
            <Button className="hidden sm:inline-flex bg-[#22C55E] hover:bg-[#16A34A] text-white" onClick={() => navigate('/login')}>Login</Button>
          </div>
        </div>
        <nav className="flex h-12 items-center justify-center gap-6 border-t text-sm">
          <Link to="/dashboard" className="font-medium text-gray-700 transition-colors hover:text-[#22C55E]">Home</Link>
          <Link to="/restaurants" className="font-medium text-gray-700 transition-colors hover:text-[#22C55E]">Find Restaurants</Link>
          <Link to="/orders" className="font-medium text-gray-700 transition-colors hover:text-[#22C55E]">Order History</Link>
          <Link to="/reviews" className="font-medium text-gray-700 transition-colors hover:text-[#22C55E]">Your Reviews</Link>
        </nav>
        <div className="pb-3 md:hidden"><div className="relative"><Input placeholder="Search restaurants, cuisines..." className="pr-10" /><Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" /></div></div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div><h3 className="mb-4 text-lg font-semibold">Our App</h3><ul className="space-y-2"><li><Link to="/" className="text-gray-600 transition-colors hover:text-[#22C55E]">About us</Link></li><li><Link to="/" className="text-gray-600 transition-colors hover:text-[#22C55E]">Customer Service</Link></li><li><Link to="/" className="text-gray-600 transition-colors hover:text-[#22C55E]">Terms & Conditions</Link></li></ul></div>
          <div><h3 className="mb-4 text-lg font-semibold">Contact</h3><ul className="space-y-2"><li><Link to="/" className="text-gray-600 transition-colors hover:text-[#22C55E]">Send an Inquiry</Link></li><li><Link to="/" className="text-gray-600 transition-colors hover:text-[#22C55E]">Support</Link></li></ul></div>
          <div><h3 className="mb-4 text-lg font-semibold">Partner with Us</h3><ul className="space-y-2"><li><a href="#" className="text-gray-600 transition-colors hover:text-[#22C55E]">Restaurant Registration</a></li><li><a href="#" className="text-gray-600 transition-colors hover:text-[#22C55E]">Become a Delivery Partner</a></li></ul></div>
          <div><h3 className="mb-4 text-lg font-semibold">Legal</h3><ul className="space-y-2"><li><a href="#" className="text-gray-600 transition-colors hover:text-[#22C55E]">Privacy Policy</a></li><li><a href="#" className="text-gray-600 transition-colors hover:text-[#22C55E]">Cookie Policy</a></li></ul></div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-gray-500"><p>&copy; 2026 Annaya Food Delivery. All rights reserved.</p></div>
      </div>
    </footer>
  );
}
