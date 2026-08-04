"use client";

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ForwardRefExoticComponent,
  type HTMLAttributes,
  type ReactNode,
  type RefAttributes,
} from "react";

export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  // `Tag` is dynamic (div, article, ...), so its exact prop/ref type can't be
  // known statically. Casting once here keeps the component honestly typed
  // everywhere else instead of suppressing an error at the call site.
  const DynamicTag = Tag as unknown as ForwardRefExoticComponent<
    HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>
  >;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <DynamicTag
      ref={ref}
      data-reveal
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms` }}
      className={className}
    >
      {children}
    </DynamicTag>
  );
}
