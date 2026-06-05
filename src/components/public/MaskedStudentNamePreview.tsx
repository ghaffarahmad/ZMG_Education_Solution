"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FEMALE_FALLBACK_NAMES,
  MALE_FALLBACK_NAMES,
  normalizePublicMaskedStudentNames,
} from "@/lib/maskedStudentNames";

type NamePreviewPayload = {
  maleNames: string[];
  femaleNames: string[];
};

const TYPE_MS = 54;
const ERASE_MS = 34;
const PAUSE_MS = 1350;
const NEXT_NAME_MS = 260;

function readNameArray(payload: Record<string, unknown>, key: keyof NamePreviewPayload) {
  const value = payload[key];
  return Array.isArray(value) ? value : [];
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(query.matches);
    const frame = window.requestAnimationFrame(updatePreference);

    query.addEventListener("change", updatePreference);

    return () => {
      window.cancelAnimationFrame(frame);
      query.removeEventListener("change", updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}

function useTypingName(names: string[], prefersReducedMotion: boolean, startDelay = 0) {
  const [typedName, setTypedName] = useState("");

  useEffect(() => {
    if (prefersReducedMotion || names.length === 0) return;

    let timeout: number;
    let nameIndex = 0;
    let characterIndex = 0;
    let isErasing = false;

    const tick = () => {
      const currentName = names[nameIndex % names.length];

      if (!isErasing) {
        characterIndex = Math.min(characterIndex + 1, currentName.length);
        setTypedName(currentName.slice(0, characterIndex));

        if (characterIndex === currentName.length) {
          isErasing = true;
          timeout = window.setTimeout(tick, PAUSE_MS);
          return;
        }

        timeout = window.setTimeout(tick, TYPE_MS);
        return;
      }

      characterIndex = Math.max(characterIndex - 1, 0);
      setTypedName(currentName.slice(0, characterIndex));

      if (characterIndex === 0) {
        isErasing = false;
        nameIndex = (nameIndex + 1) % names.length;
        timeout = window.setTimeout(tick, NEXT_NAME_MS);
        return;
      }

      timeout = window.setTimeout(tick, ERASE_MS);
    };

    timeout = window.setTimeout(tick, startDelay);

    return () => window.clearTimeout(timeout);
  }, [names, prefersReducedMotion, startDelay]);

  return prefersReducedMotion ? names[0] : typedName;
}

function toTitleCasePreviewWord(word: string) {
  const characters = Array.from(word.toLocaleLowerCase("en-US"));
  const firstCharacter = characters[0];

  if (!firstCharacter) return "";

  return `${firstCharacter.toLocaleUpperCase("en-US")}${characters.slice(1).join("")}`;
}

function getSecondInitial(value: string) {
  return Array.from(value).find((character) => /[a-z]/i.test(character))?.toLocaleUpperCase("en-US") || "";
}

function getPreviewDisplayValue(value: string) {
  const cleanedValue = value.trimStart().replace(/\s+/g, " ");
  if (!cleanedValue) return "";

  const [firstWord = "", secondWord = ""] = cleanedValue.split(" ");
  const firstName = toTitleCasePreviewWord(firstWord);

  if (!firstName) return "";
  if (!cleanedValue.includes(" ")) return firstName;

  const secondInitial = getSecondInitial(secondWord);
  const typedStars = Math.min(secondWord.split("*").length - 1, 4);
  const safeSecondName = secondInitial
    ? `${secondInitial}${"*".repeat(typedStars)}`
    : "*".repeat(typedStars);

  return safeSecondName ? `${firstName} ${safeSecondName}` : firstName;
}

function PreviewField({
  label,
  previewType,
  value,
  showCursor,
}: {
  label: string;
  previewType: "male" | "female";
  value: string;
  showCursor: boolean;
}) {
  const displayValue = getPreviewDisplayValue(value);
  const showTypingCursor = showCursor;

  return (
    <div data-preview-field={previewType} className="rounded-xl border border-white/10 bg-[#071B21]/45 p-2 sm:p-2.5">
      <div className="mb-1 flex min-w-0 items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-accent sm:text-[10px]">
        <span className="shrink-0">
          {label}
        </span>
        <span aria-hidden="true" className="text-accent/60">
          |
        </span>
        <span className="min-w-0 truncate text-accent/90">
          Secure Preview
        </span>
      </div>
      <div
        aria-label={`${label} secure student name preview`}
        className="flex h-8 min-w-0 items-center rounded-lg border border-white/10 bg-white/10 px-2 text-xs font-black text-white sm:h-9 sm:rounded-xl sm:text-sm"
      >
        <span aria-hidden="true" data-preview-name={previewType} className="min-w-0 flex-1 truncate">
          {displayValue}
        </span>
        {showTypingCursor && <span aria-hidden="true" className="ml-1 h-3.5 w-px shrink-0 animate-pulse bg-accent" />}
      </div>
    </div>
  );
}

export function MaskedStudentNamePreview() {
  const [previewNames, setPreviewNames] = useState<NamePreviewPayload>({
    maleNames: MALE_FALLBACK_NAMES,
    femaleNames: FEMALE_FALLBACK_NAMES,
  });
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let isActive = true;

    async function loadPreviewNames() {
      try {
        const response = await fetch("/api/public/student-name-preview", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load public student preview names");

        const payload = await response.json() as unknown;
        if (!payload || typeof payload !== "object") throw new Error("Invalid public student preview response");

        const data = payload as Record<string, unknown>;
        if (!isActive) return;

        setPreviewNames({
          maleNames: normalizePublicMaskedStudentNames(readNameArray(data, "maleNames"), MALE_FALLBACK_NAMES),
          femaleNames: normalizePublicMaskedStudentNames(readNameArray(data, "femaleNames"), FEMALE_FALLBACK_NAMES),
        });
      } catch {
        if (!isActive) return;

        setPreviewNames({
          maleNames: MALE_FALLBACK_NAMES,
          femaleNames: FEMALE_FALLBACK_NAMES,
        });
      }
    }

    void loadPreviewNames();

    return () => {
      isActive = false;
    };
  }, []);

  const maleNames = useMemo(
    () => normalizePublicMaskedStudentNames(previewNames.maleNames, MALE_FALLBACK_NAMES),
    [previewNames.maleNames]
  );
  const femaleNames = useMemo(
    () => normalizePublicMaskedStudentNames(previewNames.femaleNames, FEMALE_FALLBACK_NAMES),
    [previewNames.femaleNames]
  );
  const malePreview = useTypingName(maleNames, prefersReducedMotion);
  const femalePreview = useTypingName(femaleNames, prefersReducedMotion, 420);

  return (
    <div className="mt-2.5 grid gap-2 sm:mt-3 sm:gap-2.5">
      <PreviewField
        label="Male Student"
        previewType="male"
        value={malePreview}
        showCursor={!prefersReducedMotion}
      />
      <PreviewField
        label="Female Student"
        previewType="female"
        value={femalePreview}
        showCursor={!prefersReducedMotion}
      />
      <p className="rounded-xl border border-accent/20 bg-accent/10 px-2.5 py-1.5 text-[11px] font-semibold leading-4 text-slate-200">
        Your complete record appears only after secure verification.
      </p>
      <div className="flex min-h-9 items-center justify-center rounded-xl bg-accent text-xs font-black text-primary sm:min-h-10 sm:text-sm">
        Secure Verification
      </div>
    </div>
  );
}
