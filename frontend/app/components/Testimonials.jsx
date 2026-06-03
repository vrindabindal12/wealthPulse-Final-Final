'use client'
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import avatar4 from "@/assets/avatar-4.png";
import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const testimonials = [
  {
    text: "“WealthPulse gave me the confidence to start investing. The real-time insights make complex data feel simple and actionable.”",
    name: "Aarav Sharma",
    title: "Young Investor",
    avatarImg: avatar1,
  },
  {
    text: "“The AI-driven recommendations and learning hub have completely changed how I understand mutual funds and crypto.”",
    name: "Priya Mehta",
    title: "Finance Student",
    avatarImg: avatar2,
  },
  {
    text: "“As a working professional, I finally have single dashboard to track my portfolio and make smarter financial moves.”",
    name: "Rahul Khanna",
    title: "Product Manager @ FinEdge",
    avatarImg: avatar3,
  },
  {
    text: "“WealthPulse makes investing feel effortless — it’s like having a personal financial advisor powered by AI.”",
    name: "Neha Kapoor",
    title: "Entrepreneur",
    avatarImg: avatar4,
  },
];

export const Testimonials = () => {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(itemsRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power2.out"
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="testimonials" 
      className="py-40 bg-[#030303]"
    >
      <div className="container mx-auto px-6">
        <div className="mb-20 text-left max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Client <br />
            <span className="text-white/40">Perspectives.</span>
          </h2>
          <p className="text-gray-500 text-lg md:text-xl font-medium">
            Join a network of sophisticated investors who rely on our platform for their daily market execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, idx) => (
            <div
              key={`${testimonial.name}-${idx}`}
              ref={el => itemsRef.current[idx] = el}
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 transition-all duration-300 hover:bg-white/[0.04] flex flex-col h-full"
            >
              <div className="text-lg font-medium leading-relaxed text-gray-300 mb-10">
                {testimonial.text}
              </div>
              <div className="flex items-center gap-4 mt-auto">
                <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10">
                  <Image
                    src={testimonial.avatarImg}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="object-cover grayscale"
                  />
                </div>
                <div>
                  <div className="text-white font-bold text-sm tracking-tight">{testimonial.name}</div>
                  <div className="text-white/40 text-[10px] font-bold tracking-widest uppercase">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


