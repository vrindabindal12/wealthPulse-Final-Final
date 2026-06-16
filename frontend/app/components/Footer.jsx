"use client";

import { LogoIcon } from "./LogoIcon";
import { footerLinks, socialMedia } from "../constants";

const Footer = () => (
  <section className="bg-white border-t border-black/5 w-full py-16 px-8 md:px-16 flex flex-col items-center relative z-10">
    <div className="max-w-[88rem] w-full flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
      <div className="flex flex-col items-start max-w-sm">
        <div className="flex items-center gap-2 select-none mb-4">
          <LogoIcon className="w-7 h-7 text-black/90" />
          <span className="text-[22px] font-semibold tracking-[-0.03em] text-black">
            WealthPulse
          </span>
        </div>
        <p className="text-black/60 text-sm leading-relaxed">
          An automated, reward-powered digital dollar built for native passive earnings and effortless connection into DeFi.
        </p>
      </div>

      <div className="flex flex-wrap gap-12 md:gap-24">
        {footerLinks.map((footerlink) => (
          <div key={footerlink.title} className="flex flex-col min-w-[120px]">
            <h4 className="font-semibold text-xs tracking-wider text-black uppercase mb-4">
              {footerlink.title}
            </h4>
            <ul className="flex flex-col gap-3">
              {footerlink.links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black/65 hover:text-black text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="max-w-[88rem] w-full pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
      <p className="text-black/40 text-sm">
        Copyright Ⓒ 2026 WealthPulse. All rights reserved.
      </p>

      <div className="flex items-center gap-6">
        {socialMedia.map((social) => (
          <a
            key={social.id}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 transition-opacity duration-200 invert"
          >
            <img
              src={social.icon.src}
              alt={social.id}
              className="w-5 h-5 object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default Footer;