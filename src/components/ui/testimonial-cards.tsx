"use client";
import * as React from "react";
import { motion } from "framer-motion";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

type Position = "front" | "middle" | "back";

type Testimonial = {
  id: number;
  testimonial: string;
  author: string;
  role: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 47,
    testimonial:
      "A FCIA mudou minha rotina de estudos. A trilha de Frontend Moderno me preparou para uma promoção em 3 meses.",
    author: "Marina Souza",
    role: "Frontend Engineer · Nubank",
    avatar: avatar1,
  },
  {
    id: 12,
    testimonial:
      "Os certificados são reconhecidos pelo meu time. Já indiquei a plataforma para 12 colegas.",
    author: "Diego Lima",
    role: "Tech Lead · iFood",
    avatar: avatar2,
  },
  {
    id: 31,
    testimonial:
      "O AI Studio acelerou em 4x a produção de conteúdo do meu squad de educação interna.",
    author: "Aline Pires",
    role: "Design Systems Lead · Globo",
    avatar: avatar3,
  },
];

interface CardProps extends Testimonial {
  position: Position;
  handleShuffle: () => void;
}

function TestimonialCard({ handleShuffle, testimonial, role, position, author, avatar }: CardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";
  const positionStyles: Record<Position, { rotate: string; x: string; zIndex: number }> = {
    front: { rotate: "-5deg", x: "0%", zIndex: 3 },
    middle: { rotate: "0deg", x: "22px", zIndex: 2 },
    back: { rotate: "5deg", x: "44px", zIndex: 1 },
  };

  return (
    <motion.div
      animate={{ rotate: positionStyles[position].rotate, x: positionStyles[position].x }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={(e: MouseEvent | TouchEvent | PointerEvent) => {
        dragRef.current = "clientX" in e ? e.clientX : (e as TouchEvent).touches[0].clientX;
      }}
      onDragEnd={(e: MouseEvent | TouchEvent | PointerEvent) => {
        const endX = "clientX" in e ? e.clientX : (e as TouchEvent).changedTouches[0].clientX;
        if (Math.abs(dragRef.current - endX) > 100) handleShuffle();
        dragRef.current = 0;
      }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 25 }}
      className={`absolute left-0 top-0 flex h-[380px] w-[300px] select-none flex-col items-center gap-4 rounded-2xl border p-6 shadow-2xl ${
        isFront
          ? "cursor-grab border-primary/40 active:cursor-grabbing"
          : "border-border/60"
      }`}
      style={{ zIndex: positionStyles[position].zIndex, backgroundColor: "oklch(0.14 0.03 265)" }}
    >
      <img
        src={avatar}
        alt={author}
        width={72}
        height={72}
        loading="lazy"
        className="h-18 w-18 rounded-full object-cover ring-2 ring-primary/40"
        style={{ height: 72, width: 72 }}
      />
      <div className="flex gap-1 text-primary">
        {[...Array(5)].map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      <p className="text-center text-sm leading-relaxed text-foreground">"{testimonial}"</p>
      <div className="mt-auto text-center">
        <p className="text-sm font-semibold text-foreground">{author}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </motion.div>
  );
}

export function ShuffleTestimonials() {
  const [positions, setPositions] = React.useState<Position[]>(["front", "middle", "back"]);

  const handleShuffle = () => {
    setPositions((prev) => {
      const next = [...prev];
      next.unshift(next.pop() as Position);
      return next;
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <span className="eyebrow text-primary">Prova social</span>
        <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          Quem comprou, recomenda
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">Arraste o card ou clique no botão</p>
      </header>

      <div className="relative mx-auto h-[420px] w-[344px]">
        {TESTIMONIALS.map((t, index) => (
          <TestimonialCard key={t.id} {...t} position={positions[index]} handleShuffle={handleShuffle} />
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleShuffle}
          className="rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-sm font-medium text-foreground transition hover:bg-primary/20"
        >
          Próximo depoimento →
        </button>
        <p className="text-xs text-muted-foreground">+2.400 alunos satisfeitos</p>
      </div>
    </section>
  );
}