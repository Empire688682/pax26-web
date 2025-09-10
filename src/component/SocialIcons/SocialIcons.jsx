import { SiFacebook, SiX, SiInstagram, SiTiktok } from 'react-icons/si';

export default function SocialIcons() {
  return (
    <div className="flex gap-4 pt-4">
      <a href="#" aria-label="Facebook">
        <SiFacebook className="text-[#1877F2] w-6 h-6 hover:scale-110 transition-transform duration-200" />
      </a>
      <a href="https://x.com/pax26app" aria-label="X (formerly Twitter)">
        <SiX className="text-black w-6 h-6 hover:scale-110 transition-transform duration-200" />
      </a>
      <a href="https://www.tiktok.com/@pax26app" aria-label="Tiktok">
        <SiTiktok className="text-[#E1306C] w-6 h-6 hover:scale-110 transition-transform duration-200" />
      </a>
      <a href="https://www.instagram.com/pax26app/" aria-label="Instagram">
        <SiInstagram className="text-[#E1306C] w-6 h-6 hover:scale-110 transition-transform duration-200" />
      </a>
    </div>
  );
}
