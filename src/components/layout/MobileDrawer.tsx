"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type StoredElementState = {
  element: HTMLElement;
  ariaHidden: string | null;
  inert: boolean;
};

type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
  overlayClassName?: string;
  restoreFocusRef?: React.RefObject<HTMLElement | null>;
};

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.getAttribute("aria-hidden") === "true") return false;
    if (element.tabIndex < 0) return false;

    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  ariaLabel,
  className,
  overlayClassName,
  restoreFocusRef,
}: MobileDrawerProps) {
  const [portal] = useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;

    const element = document.createElement("div");
    element.setAttribute("data-mobile-drawer-root", "");
    return element;
  });
  const [isPresent, setIsPresent] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const shouldRestoreFocusRef = useRef(false);

  useEffect(() => {
    if (!portal) return;

    document.body.appendChild(portal);

    return () => {
      portal.remove();
    };
  }, [portal]);

  useEffect(() => {
    if (!isOpen) return;

    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    shouldRestoreFocusRef.current = true;

    let visibleFrame: number | null = null;
    const presentFrame = window.requestAnimationFrame(() => {
      setIsPresent(true);
      visibleFrame = window.requestAnimationFrame(() => setIsVisible(true));
    });

    return () => {
      window.cancelAnimationFrame(presentFrame);
      if (visibleFrame !== null) window.cancelAnimationFrame(visibleFrame);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;

    const hideFrame = window.requestAnimationFrame(() => setIsVisible(false));

    if (!isPresent) {
      return () => window.cancelAnimationFrame(hideFrame);
    }

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320;
    const timer = window.setTimeout(() => setIsPresent(false), delay);
    return () => {
      window.cancelAnimationFrame(hideFrame);
      window.clearTimeout(timer);
    };
  }, [isOpen, isPresent]);

  useEffect(() => {
    if (!isPresent) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const previousBodyStyle = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    const previousHtmlStyle = {
      overflow: html.style.overflow,
      overscrollBehavior: html.style.overscrollBehavior,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyStyle.overflow;
      body.style.position = previousBodyStyle.position;
      body.style.top = previousBodyStyle.top;
      body.style.left = previousBodyStyle.left;
      body.style.right = previousBodyStyle.right;
      body.style.width = previousBodyStyle.width;
      html.style.overflow = previousHtmlStyle.overflow;
      html.style.overscrollBehavior = previousHtmlStyle.overscrollBehavior;
      window.scrollTo(0, scrollY);
    };
  }, [isPresent]);

  useEffect(() => {
    if (!isPresent || !portal) return;

    const storedStates: StoredElementState[] = [];

    Array.from(document.body.children).forEach((child) => {
      if (child === portal || !(child instanceof HTMLElement)) return;

      const inertChild = child as HTMLElement & { inert: boolean };
      storedStates.push({
        element: child,
        ariaHidden: child.getAttribute("aria-hidden"),
        inert: inertChild.inert,
      });
      child.setAttribute("aria-hidden", "true");
      inertChild.inert = true;
    });

    return () => {
      storedStates.forEach(({ element, ariaHidden, inert }) => {
        const inertElement = element as HTMLElement & { inert: boolean };

        if (ariaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", ariaHidden);
        }

        inertElement.inert = inert;
      });
    };
  }, [isPresent, portal]);

  useEffect(() => {
    if (!isOpen) return;

    const focusFirstElement = () => {
      const focusTarget = getFocusableElements(drawerRef.current)[0] ?? drawerRef.current;
      focusTarget?.focus({ preventScroll: true });
    };

    const frame = window.requestAnimationFrame(focusFirstElement);
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isPresent) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(drawerRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        drawerRef.current?.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const drawer = drawerRef.current;
      const target = event.target;

      if (!drawer || !(target instanceof Node) || drawer.contains(target)) return;

      const focusTarget = getFocusableElements(drawer)[0] ?? drawer;
      focusTarget.focus({ preventScroll: true });
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", handleFocusIn, true);
    };
  }, [isPresent, onClose]);

  useEffect(() => {
    if (isPresent || !shouldRestoreFocusRef.current) return;

    shouldRestoreFocusRef.current = false;
    const restoreTarget = restoreFocusRef?.current ?? lastFocusedElementRef.current;
    window.requestAnimationFrame(() => restoreTarget?.focus({ preventScroll: true }));
  }, [isPresent, restoreFocusRef]);

  if (!portal || !isPresent) return null;

  return createPortal(
    <div className="md:hidden">
      <div
        className={cn(
          "fixed inset-0 z-[1000] bg-slate-950/68 opacity-0 backdrop-blur-sm transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isVisible && "opacity-100",
          overlayClassName
        )}
        style={{ zIndex: 1000 }}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 left-0 z-[1010] flex h-dvh w-[84vw] max-w-[22rem] -translate-x-full flex-col overflow-hidden border-r border-slate-200 bg-white opacity-0 shadow-2xl shadow-slate-950/30 outline-none transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform dark:border-white/10 dark:bg-[#092128] dark:shadow-black/40",
          isVisible && "translate-x-0 opacity-100",
          className
        )}
        style={{ zIndex: 1010, width: "min(84vw, 22rem)" }}
      >
        {children}
      </div>
    </div>,
    portal
  );
}
