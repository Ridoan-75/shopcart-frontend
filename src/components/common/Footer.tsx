// // components/common/Footer.tsx
// import Link from "next/link";
// import {
//   FaFacebook,
//   FaTwitter,
//   FaInstagram,
//   FaYoutube,
//   FaLinkedin, // ✅ NOTE: FaLinkedin (not FaLinkedinIn if you prefer this one)
// } from "react-icons/fa";;
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";

// // ── Static Data ──────────────────────────────────────────
// const FOOTER_LINKS = {
//   company: [
//     { label: "About Us", href: "/about" },
//     { label: "Blog", href: "/blog" },
//     { label: "Careers", href: "#" },
//     { label: "Press", href: "#" },
//     { label: "Contact Us", href: "/contact" },
//   ],
//   support: [
//     { label: "Help Center", href: "/faq" },
//     { label: "Order Tracking", href: "/dashboard/user/orders" },
//     { label: "Returns & Refunds", href: "#" },
//     { label: "Shipping Info", href: "#" },
//     { label: "Size Guide", href: "#" },
//   ],
//   account: [
//     { label: "My Account", href: "/dashboard" },
//     { label: "My Orders", href: "/dashboard/user/orders" },
//     { label: "My Wishlist", href: "/wishlist" },
//     { label: "My Reviews", href: "/dashboard/user/reviews" },
//     { label: "Addresses", href: "/dashboard/user/addresses" },
//   ],
//   legal: [
//     { label: "Privacy Policy", href: "#" },
//     { label: "Terms of Service", href: "#" },
//     { label: "Cookie Policy", href: "#" },
//     { label: "Disclaimer", href: "#" },
//   ],
// };

// const SOCIAL_LINKS = [
//   { icon: Facebook, href: "#", label: "Facebook" },
//   { icon: Twitter, href: "#", label: "Twitter" },
//   { icon: Instagram, href: "#", label: "Instagram" },
//   { icon: Youtube, href: "#", label: "Youtube" },
//   { icon: Linkedin, href: "#", label: "LinkedIn" },
// ];

// const FEATURES = [
//   { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
//   { icon: RefreshCcw, title: "Easy Returns", desc: "30-day return policy" },
//   { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected" },
//   { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
// ];

// const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "PayPal", "Stripe"];

// // ── Feature Strip ─────────────────────────────────────────
// function FeatureStrip() {
//   return (
//     <div className="bg-[#f2f4f8] border-t border-gray-200 w-full">
//       <div className="max-w-[1400px] mx-auto px-6 py-8">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//           {FEATURES.map((f) => {
//             const Icon = f.icon;
//             return (
//               <div key={f.title} className="flex items-center gap-4">
//                 <div className="w-11 h-11 rounded-xl bg-tech_purple/10 flex items-center justify-center flex-shrink-0">
//                   <Icon size={20} className="text-tech_purple" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold text-tech_black">{f.title}</p>
//                   <p className="text-xs text-gray-500">{f.desc}</p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main Footer ───────────────────────────────────────────
// export default function Footer() {
//   return (
//     <footer className="w-full">
//       <FeatureStrip />

//       <div className="bg-tech_black w-full">
//         <div className="max-w-[1400px] mx-auto px-6 py-16">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

//             {/* Brand Column */}
//             <div className="lg:col-span-2">
//               {/* Logo */}
//               <Link href="/" className="flex items-center gap-2.5 mb-5">
//                 <div className="w-9 h-9 rounded-xl bg-tech_purple flex items-center justify-center">
//                   <span className="text-white font-black text-xl leading-none">S</span>
//                 </div>
//                 <span className="text-[22px] font-black text-white tracking-tight">
//                   Shop<span className="text-tech_purple">ly</span>
//                 </span>
//               </Link>

//               <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
//                 Your one-stop destination for premium products. Shop smarter,
//                 live better — with exclusive deals every day.
//               </p>

//               {/* Contact Info */}
//               <div className="space-y-3 mb-6">
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
//                     <MapPin size={14} className="text-tech_purple" />
//                   </div>
//                   <span className="text-gray-400 text-sm">123 Commerce Street, Dhaka, BD</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
//                     <Phone size={14} className="text-tech_purple" />
//                   </div>
//                   <span className="text-gray-400 text-sm">+880 1234-567890</span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
//                     <Mail size={14} className="text-tech_purple" />
//                   </div>
//                   <span className="text-gray-400 text-sm">support@shoply.com</span>
//                 </div>
//               </div>

//               {/* Social Links */}
//               <div className="flex items-center gap-2">
//                 {SOCIAL_LINKS.map((s) => {
//                   const Icon = s.icon;
//                   return (
//                     <Link
//                       key={s.label}
//                       href={s.href}
//                       aria-label={s.label}
//                       className="w-9 h-9 rounded-xl bg-white/5 hover:bg-tech_purple flex items-center justify-center transition-colors"
//                     >
//                       <Icon size={15} className="text-gray-400 hover:text-white transition-colors" />
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Company Links */}
//             <div>
//               <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
//                 Company
//               </h4>
//               <ul className="space-y-3">
//                 {FOOTER_LINKS.company.map((link) => (
//                   <li key={link.label}>
//                     <Link
//                       href={link.href}
//                       className="text-gray-400 hover:text-tech_purple text-sm transition-colors"
//                     >
//                       {link.label}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Support Links */}
//             <div>
//               <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
//                 Support
//               </h4>
//               <ul className="space-y-3">
//                 {FOOTER_LINKS.support.map((link) => (
//                   <li key={link.label}>
//                     <Link
//                       href={link.href}
//                       className="text-gray-400 hover:text-tech_purple text-sm transition-colors"
//                     >
//                       {link.label}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Account Links */}
//             <div>
//               <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
//                 My Account
//               </h4>
//               <ul className="space-y-3">
//                 {FOOTER_LINKS.account.map((link) => (
//                   <li key={link.label}>
//                     <Link
//                       href={link.href}
//                       className="text-gray-400 hover:text-tech_purple text-sm transition-colors"
//                     >
//                       {link.label}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Newsletter */}
//             <div>
//               <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">
//                 Newsletter
//               </h4>
//               <p className="text-gray-400 text-sm mb-4 leading-relaxed">
//                 Subscribe and get exclusive deals, new arrivals and discount offers.
//               </p>
//               <div className="flex flex-col gap-2">
//                 <div className="relative">
//                   <Input
//                     placeholder="Your email address"
//                     className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-11 pr-12 rounded-xl focus-visible:border-tech_purple focus-visible:ring-0"
//                   />
//                   <button className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center bg-tech_purple hover:bg-tech_purple/90 rounded-r-xl transition-colors">
//                     <Send size={15} className="text-white" />
//                   </button>
//                 </div>
//                 <p className="text-gray-500 text-xs">
//                   No spam. Unsubscribe anytime.
//                 </p>
//               </div>

//               {/* App Download */}
//               <div className="mt-6">
//                 <p className="text-gray-500 text-xs mb-3 uppercase tracking-wide">
//                   Download App
//                 </p>
//                 <div className="flex flex-col gap-2">
//                   <Link
//                     href="#"
//                     className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
//                   >
//                     <div className="text-white text-xs">
//                       <p className="text-[10px] text-gray-400">Get it on</p>
//                       <p className="font-semibold">Google Play</p>
//                     </div>
//                   </Link>
//                   <Link
//                     href="#"
//                     className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
//                   >
//                     <div className="text-white text-xs">
//                       <p className="text-[10px] text-gray-400">Download on</p>
//                       <p className="font-semibold">App Store</p>
//                     </div>
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="border-t border-white/5 w-full">
//           <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
//             <p className="text-gray-500 text-xs text-center sm:text-left">
//               © {new Date().getFullYear()} Shoply. All rights reserved.
//             </p>

//             {/* Legal Links */}
//             <div className="flex items-center gap-1 text-xs text-gray-500">
//               {FOOTER_LINKS.legal.map((link, i) => (
//                 <span key={link.label} className="flex items-center">
//                   <Link href={link.href} className="hover:text-gray-300 transition-colors px-2">
//                     {link.label}
//                   </Link>
//                   {i < FOOTER_LINKS.legal.length - 1 && (
//                     <span className="text-white/10">|</span>
//                   )}
//                 </span>
//               ))}
//             </div>

//             {/* Payment Icons */}
//             <div className="flex items-center gap-1.5">
//               {PAYMENT_METHODS.map((method) => (
//                 <div
//                   key={method}
//                   className="px-2.5 py-1 bg-white/5 rounded-md border border-white/10 text-[10px] text-gray-400 font-medium"
//                 >
//                   {method}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }