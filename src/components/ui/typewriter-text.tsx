"use client";

import * as React from "react"
import { useEffect, useState } from "react";
 
export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: boolean;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}
 
export function TypewriterText({
  text,
  speed = 50,
  deleteSpeed = 30,
  delay = 1500,
  className = '',
  loop = false,
  cursor = false
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
 
  const texts = Array.isArray(text) ? text : [text];
 
  useEffect(() => {
    if (isWaiting) {
      const waitTimer = setTimeout(() => {
        setIsWaiting(false);
        setIsDeleting(true);
      }, delay);
      return () => clearTimeout(waitTimer);
    }
 
    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        return;
      }
 
      const deleteTimer = setTimeout(() => {
        setDisplayText((prev) => prev.slice(0, -1));
      }, deleteSpeed);
      return () => clearTimeout(deleteTimer);
    }
 
    const currentFullText = texts[currentTextIndex];
    if (displayText === currentFullText) {
      if (!loop && currentTextIndex === texts.length - 1) {
        return;
      }
      setIsWaiting(true);
      return;
    }
 
    const typeTimer = setTimeout(() => {
      setDisplayText((prev) => currentFullText.slice(0, prev.length + 1));
    }, speed);
    return () => clearTimeout(typeTimer);
  }, [displayText, currentTextIndex, isDeleting, isWaiting, texts, speed, deleteSpeed, delay, loop]);
 
  return (
    <span className={className}>
      {displayText}
      {cursor && <span className="animate-blink">|</span>}
    </span>
  );
} 