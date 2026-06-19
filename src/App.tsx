/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Timer, 
  Play, 
  Pause, 
  Sparkles, 
  Wind, 
  BookOpen, 
  Mail, 
  ArrowRight, 
  Compass, 
  Globe, 
  Check, 
  RefreshCw,
  Clock
} from "lucide-react";

type ModalType = "studio" | "about" | "journal" | "reach" | null;

interface JournalEntry {
  id: string;
  timestamp: string;
  title: string;
  content: string;
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Active interaction modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Studio Flow / Breath & Focus Tool State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [focusTimeLeft, setFocusTimeLeft] = useState(1500); // 25-minute Deep flow
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.5);

  // Journal State (using LocalStorage for persistence of thoughts)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newJournalTitle, setNewJournalTitle] = useState("");
  const [newJournalContent, setNewJournalContent] = useState("");

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Scroll Listener for Smooth Parallax Movement
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 2. Custom fade-in/fade-out video loop monitor using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const monitorTime = () => {
      const video = videoRef.current;
      if (video && video.duration) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        const fadeDuration = 0.5; // fade duration in seconds

        setPlaybackTime(currentTime);
        setVideoDuration(duration);

        let targetOpacity = 1;

        if (currentTime < fadeDuration) {
          // Linear Fade-in at the beginning
          targetOpacity = currentTime / fadeDuration;
        } else if (currentTime > duration - fadeDuration) {
          // Linear Fade-out before loop end
          targetOpacity = (duration - currentTime) / fadeDuration;
        }

        // Clamp opacity between 0 and 1
        const finalOpacity = Math.max(0, Math.min(1, targetOpacity));
        setVideoOpacity(finalOpacity);
      }
      animationFrameId = requestAnimationFrame(monitorTime);
    };

    animationFrameId = requestAnimationFrame(monitorTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 3. Dynamic Breathing Loop logic
  useEffect(() => {
    let interval: any;
    if (isBreathing) {
      let counter = 0;
      interval = setInterval(() => {
        counter = (counter + 1) % 12;
        if (counter < 4) {
          setBreathPhase("Inhale");
        } else if (counter < 8) {
          setBreathPhase("Hold");
        } else {
          setBreathPhase("Exhale");
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  // 4. Focus Timer tracking
  useEffect(() => {
    let timerInterval: any;
    if (isTimerRunning && focusTimeLeft > 0) {
      timerInterval = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (focusTimeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerRunning, focusTimeLeft]);

  // 5. Initial journal entries list load/setup
  useEffect(() => {
    const saved = localStorage.getItem("aethera_journal_entries");
    if (saved) {
      try {
        setJournalEntries(JSON.parse(saved));
      } catch (e) {
        console.warn("Could not parse saved journal items", e);
      }
    } else {
      // Default inspiring entry
      const initial: JournalEntry[] = [
        {
          id: "1",
          timestamp: "JUNE 19, 2026",
          title: "The Architecture of Quietude",
          content: "In building spatial web platforms, noise is our primary resistance. Elegance is not what we add, but what we curate. Silence is spatial logic in physical form."
        }
      ];
      setJournalEntries(initial);
      localStorage.setItem("aethera_journal_entries", JSON.stringify(initial));
    }
  }, []);

  const handleEnded = () => {
    const video = videoRef.current;
    if (video) {
      setVideoOpacity(0);
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch((err) => {
            console.warn("Autoplay or seek replay prevented", err);
          });
        }
      }, 100);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        console.warn("Autoplay prevented on initial load", err);
      });
    }
  }, []);

  // Save new journal reflection
  const handleSaveJournal = (e: FormEvent) => {
    e.preventDefault();
    if (!newJournalTitle.trim() || !newJournalContent.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }).toUpperCase(),
      title: newJournalTitle.trim(),
      content: newJournalContent.trim()
    };

    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem("aethera_journal_entries", JSON.stringify(updated));
    setNewJournalTitle("");
    setNewJournalContent("");
  };

  // Submit secure contact request
  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setContactName("");
      setContactEmail("");
      setContactMsg("");
    }, 1200);
  };

  // Safe time formatter for focus timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-[140vh] w-full bg-[#FFFFFF] overflow-x-hidden font-sans text-[#000000] flex flex-col selection:bg-black selection:text-white">
      
      {/* Background layer with parallax translation offset based on user scroll offset */}
      <div
        className="absolute z-0 pointer-events-none overflow-hidden"
        style={{
          top: "300px",
          inset: "auto 0 0 0",
          opacity: videoOpacity,
          height: "calc(100% - 300px)",
          transform: `translateY(${scrollY * 0.18}px)`, // Gentle Parallax Movement Effect
          transition: "transform 0.1s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 0.3s ease-out"
        }}
        id="bg-video-wrapper"
      >
        <video
          ref={videoRef}
          onEnded={handleEnded}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
        />
        {/* Absolute gradient overlays blend with background perfectly */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none" 
          id="video-gradient-overlay"
        />
      </div>

      {/* Decorative clean glass horizon separator */}
      <div 
        className="absolute top-[300px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#6f6f6f]/15 to-transparent pointer-events-none z-1" 
        style={{ transform: `translateY(${scrollY * 0.05}px)` }}
      />

      {/* Navigation Bar */}
      <nav id="navbar" className="relative z-20 w-full bg-white/80 backdrop-blur-md border-b border-black/[0.03] sticky top-0">
        <div className="max-w-7xl mx-auto px-12 py-8 flex justify-between items-center w-full">
          {/* Logo */}
          <a
            href="#"
            id="logo-brand" 
            onClick={(e) => {
              e.preventDefault();
              setActiveModal(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-3xl tracking-tight font-instrument text-[#000000] hover:scale-[1.01] active:scale-95 transition-all duration-300 transform-gpu"
          >
            Aethera<sup className="text-xs ml-0.5 relative -top-2">®</sup>
          </a>

          {/* Menus with active high contrast highlight states */}
          <div id="nav-menu" className="hidden md:flex items-center gap-10">
            <button
              onClick={() => {
                setActiveModal(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`text-sm font-medium transition-colors duration-300 ${!activeModal ? "text-black border-b border-black pb-1" : "text-[#6F6F6F] hover:text-black"}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveModal("studio")}
              className={`text-sm font-medium transition-colors duration-300 ${activeModal === "studio" ? "text-black border-b border-black pb-1" : "text-[#6F6F6F] hover:text-black"}`}
            >
              Studio
            </button>
            <button
              onClick={() => setActiveModal("about")}
              className={`text-sm font-medium transition-colors duration-300 ${activeModal === "about" ? "text-black border-b border-black pb-1" : "text-[#6F6F6F] hover:text-black"}`}
            >
              About
            </button>
            <button
              onClick={() => setActiveModal("journal")}
              className={`text-sm font-medium transition-colors duration-300 ${activeModal === "journal" ? "text-black border-b border-black pb-1" : "text-[#6F6F6F] hover:text-black"}`}
            >
              Journal
            </button>
            <button
              onClick={() => setActiveModal("reach")}
              className={`text-sm font-medium transition-colors duration-300 ${activeModal === "reach" ? "text-black border-b border-black pb-1" : "text-[#6F6F6F] hover:text-black"}`}
            >
              Reach Us
            </button>
          </div>

          {/* Navigation CTA Button to launch modular workflow directly */}
          <div id="nav-cta-container">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModal("studio")}
              className="rounded-full px-6 py-2.5 text-sm font-medium bg-black text-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              Begin Journey
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Container Area hosting beautiful Hero or Active Interactive Space */}
      <div className="relative z-10 flex-1 flex flex-col justify-start">
        
        {/* Interactive Overlay Dialog System (revealing the core values when navigation clicked) */}
        <AnimatePresence mode="wait">
          {activeModal && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl mx-auto px-6 py-10 mt-6 bg-white/90 backdrop-blur-xl border border-black/5 rounded-3xl shadow-2xl z-30 mb-12"
            >
              <div className="flex justify-between items-center border-b border-black/5 pb-6 mb-8">
                <div className="flex items-center space-x-3">
                  <span className="w-2 h-2 rounded-full bg-black block" />
                  <h2 className="font-instrument text-3xl tracking-tight capitalize text-black">
                    {activeModal === "studio" && "Aethera Studio™"}
                    {activeModal === "about" && "The Architecture of Quietude"}
                    {activeModal === "journal" && "The Sovereign Stream"}
                    {activeModal === "reach" && "Direct Terminal Inquiry"}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer text-[#6F6F6F] hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STUDIO: Breathing Visualizer, Focus Timer, Calm Engine */}
              {activeModal === "studio" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
                  <div className="border border-black/5 rounded-2xl p-6 bg-neutral-50/50 flex flex-col items-center justify-between min-h-[340px]">
                    <div className="w-full flex justify-between items-center">
                      <span className="text-xs font-mono tracking-wider text-[#6F6F6F]">BREATHING CYCLE</span>
                      <span className="text-xs font-mono bg-black text-white px-2 py-0.5 rounded uppercase">
                        {isBreathing ? "Active Flow" : "Suspended"}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center my-8">
                      {/* Pulse circle governed by breathing state */}
                      <motion.div
                        animate={{
                          scale: isBreathing ? (breathPhase === "Inhale" ? 1.6 : breathPhase === "Hold" ? 1.6 : 0.9) : 1.0,
                          backgroundColor: isBreathing ? "rgba(0, 0, 0, 0.04)" : "rgba(0, 0, 0, 0.02)"
                        }}
                        transition={{ duration: 3.5, ease: "easeInOut" }}
                        className="w-32 h-32 rounded-full border border-black/10 flex items-center justify-center relative"
                      >
                        <Wind className={`w-8 h-8 text-black ${isBreathing ? "animate-pulse" : ""}`} />
                        {isBreathing && (
                          <span className="absolute bottom-4 text-[10px] font-mono tracking-widest uppercase">
                            {breathPhase}
                          </span>
                        )}
                      </motion.div>
                    </div>

                    <button
                      onClick={() => setIsBreathing(!isBreathing)}
                      className="w-full rounded-full bg-black text-white py-3.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-transform cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <span>{isBreathing ? "Pause Breath Cycle" : "Initiate Breathing Guide"}</span>
                    </button>
                  </div>

                  <div className="border border-black/5 rounded-2xl p-6 bg-neutral-50/50 flex flex-col justify-between min-h-[340px]">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-mono tracking-wider text-[#6F6F6F]">FLOW ENGINE (POMODORO)</span>
                        <Timer className="w-4 h-4 text-[#6F6F6F]" />
                      </div>

                      <div className="text-center my-6">
                        <div className="text-6xl font-light tracking-tight font-mono text-black">
                          {formatTime(focusTimeLeft)}
                        </div>
                        <p className="text-xs text-[#6F6F6F] mt-2 font-mono">STABILIZE DEEP ATTENTION</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          className="flex-1 rounded-full bg-black text-white py-3 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center space-x-2"
                        >
                          {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span>{isTimerRunning ? "Suspend" : "Calibrate Focus"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsTimerRunning(false);
                            setFocusTimeLeft(1500);
                          }}
                          aria-label="Reset Timer"
                          className="px-4 rounded-full border border-black/10 hover:bg-black/5 transition-colors cursor-pointer flex items-center justify-center"
                        >
                          <RefreshCw className="w-4 h-4 text-black" />
                        </button>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-black/5">
                        <label className="text-xs font-mono text-[#6F6F6F] block mb-2">AMBIENT WAVEFORM GAIN (VOLUME)</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={ambientVolume}
                          onChange={(e) => {
                            setAmbientVolume(parseFloat(e.target.value));
                            if (videoRef.current) {
                              videoRef.current.volume = parseFloat(e.target.value);
                            }
                          }}
                          className="w-full accent-black bg-neutral-200 h-1 rounded-full cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABOUT: Platform Aesthetics & Manifesto */}
              {activeModal === "about" && (
                <div className="space-y-8 font-sans">
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-lg text-black leading-relaxed font-instrument italic">
                      "Aethera represents the return of tranquility inside digital spaces. We build spaces designed to serve your thoughts rather than hijack them."
                    </p>
                    <div className="h-[1px] bg-black/5 my-6" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 rounded-xl border border-black/5 bg-neutral-50/50">
                        <Compass className="w-5 h-5 text-black mb-3" />
                        <h4 className="font-semibold text-sm tracking-tight text-black">Aesthetic Geometry</h4>
                        <p className="text-xs text-[#6F6F6F] mt-2 leading-relaxed">
                          We believe typography and layouts act as intellectual interfaces. Every pixel aligns to natural geometric proportions to relieve digital fatigue.
                        </p>
                      </div>
                      <div className="p-5 rounded-xl border border-black/5 bg-neutral-50/50">
                        <Globe className="w-5 h-5 text-black mb-3" />
                        <h4 className="font-semibold text-sm tracking-tight text-black">Silent Mechanics</h4>
                        <p className="text-xs text-[#6F6F6F] mt-2 leading-relaxed">
                          All components rely on uncompromised asynchronous workflows. There are no unsolicited alerts, persistent notifications, or predatory analytics triggers.
                        </p>
                      </div>
                      <div className="p-5 rounded-xl border border-black/5 bg-neutral-50/50">
                        <Sparkles className="w-5 h-5 text-black mb-3" />
                        <h4 className="font-semibold text-sm tracking-tight text-black">Sensory Mediums</h4>
                        <p className="text-xs text-[#6F6F6F] mt-2 leading-relaxed">
                          Dynamic elements react seamlessly to user gestures and micro-signals, integrating atmospheric video loops that simulate natural horizons.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-100 flex items-center space-x-3 text-xs text-[#6F6F6F]">
                    <Clock className="w-4 h-4 text-[#6F6F6F]" />
                    <span>The continuous loop ambient audio stems directly from our customized cloud compression flow.</span>
                  </div>
                </div>
              )}

              {/* JOURNAL: Interactive Thoughts Ledger (LocalStorage-connected) */}
              {activeModal === "journal" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 font-sans">
                  
                  {/* Ledger Form */}
                  <div className="md:col-span-2 border-r border-black/5 pr-0 md:pr-8">
                    <h3 className="text-sm font-semibold tracking-tight text-black mb-4">LOG NEW CONTINUUM ENTRY</h3>
                    <form onSubmit={handleSaveJournal} className="space-y-4">
                      <div>
                        <label className="text-xs font-mono text-[#6F6F6F] block mb-1">JOURNAL ITEM TITLE</label>
                        <input
                          type="text"
                          required
                          value={newJournalTitle}
                          onChange={(e) => setNewJournalTitle(e.target.value)}
                          placeholder="e.g. Deep Work Horizon"
                          className="w-full text-sm border border-black/10 rounded-lg px-3 py-2 bg-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-mono text-[#6F6F6F] block mb-1">SOVEREIGN REFLECTION</label>
                        <textarea
                          required
                          rows={4}
                          value={newJournalContent}
                          onChange={(e) => setNewJournalContent(e.target.value)}
                          placeholder="Pen down your focus journey details..."
                          className="w-full text-sm border border-black/10 rounded-lg px-3 py-2 bg-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-full bg-black text-white text-xs py-3 font-semibold hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
                      >
                        Publish to Local Ledger
                      </button>
                    </form>
                  </div>

                  {/* Saved Items */}
                  <div className="md:col-span-3 space-y-4 max-h-[380px] overflow-y-auto pr-2">
                    <h3 className="text-sm font-semibold tracking-tight text-black mb-4">SOVEREIGN REFLECTIONS HISTORY</h3>
                    {journalEntries.length === 0 ? (
                      <p className="text-xs text-[#6F6F6F] italic">No thoughts registered yet.</p>
                    ) : (
                      journalEntries.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl border border-black/5 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-sm text-black">{item.title}</h4>
                            <span className="text-[9px] font-mono text-[#6F6F6F]">{item.timestamp}</span>
                          </div>
                          <p className="text-xs text-[#6F6F6F] leading-relaxed whitespace-pre-line">{item.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* REACH US: Secure Boutique Correspondence Inquiry */}
              {activeModal === "reach" && (
                <div className="max-w-xl mx-auto font-sans">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-12 px-6 border border-black/5 rounded-2xl bg-neutral-50/50"
                    >
                      <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-4">
                        <Check className="w-6 h-6" />
                      </div>
                      <h3 className="font-instrument text-2xl mb-2 text-black">Transmission Acknowledged</h3>
                      <p className="text-sm text-[#6F6F6F] max-w-sm mx-auto leading-relaxed">
                        Your inquiry has reached Aethera studio. We monitor transmission streams once per cycle. We will be in touch shortly.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="mt-6 text-xs underline font-semibold cursor-pointer text-black"
                      >
                        Send another letter
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <div className="text-center mb-6">
                        <p className="text-xs font-mono text-[#6F6F6F] uppercase tracking-wider">SECURE TRANSMISSION ENVELOPE</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-mono text-[#6F6F6F] block mb-1">YOUR NOM DE PLUME / NAME</label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Aurelius"
                            className="w-full text-sm border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-mono text-[#6F6F6F] block mb-1">ELECTRONIC COORDINATE / EMAIL</label>
                          <input
                            type="email"
                            required
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="aurelius@silence.net"
                            className="w-full text-sm border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-mono text-[#6F6F6F] block mb-1">PROPOSAL / LETTER</label>
                        <textarea
                          required
                          rows={4}
                          value={contactMsg}
                          onChange={(e) => setContactMsg(e.target.value)}
                          placeholder="How would you like to build the eternal with us?"
                          className="w-full text-sm border border-black/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-black text-white py-3.5 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-transform cursor-pointer flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Aligning terminal protocols...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            <span>Transmit Letter to Aethera</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <main
          id="hero-section"
          className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-12"
          style={{
            paddingTop: "calc(8rem - 75px)",
            paddingBottom: "10rem", // pb-40
          }}
        >
          <div id="hero-content" className="max-w-6xl w-full flex flex-col items-center">
            
            {/* Headline heading in Instrument Serif conforming perfectly to Clean Minimalism theme metrics */}
            <h1
              id="hero-heading"
              className="text-5xl sm:text-7xl md:text-8xl lg:text-[104px] font-normal font-instrument text-[#000000] leading-[0.95] tracking-[-2.46px] max-w-7xl animate-fade-rise text-pretty"
              style={{
                lineHeight: 0.95,
                letterSpacing: "-2.46px",
              }}
            >
              Beyond{" "}
              <span className="italic text-[#6F6F6F] font-instrument">silence,</span>{" "}
              we build <br className="hidden md:block" />
              <span className="italic text-[#6F6F6F] font-instrument">the eternal.</span>
            </h1>

            {/* Description body text in Inter */}
            <p
              id="hero-desc"
              className="text-lg sm:text-xl max-w-2xl mt-10 text-[#6F6F6F] leading-relaxed font-normal animate-fade-rise-delay mx-auto"
            >
              Building platforms for brilliant minds, fearless makers, and thoughtful souls.
              Through the noise, we craft digital havens for deep work and pure flows.
            </p>

            {/* Hero CTA Button - seamlessly activates the immersive Studio focus tool */}
            <div id="hero-cta-btn-wrapper" className="animate-fade-rise-delay-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveModal("studio");
                  // Smoothly scroll to the modal interactive space if active
                  setTimeout(() => {
                    window.scrollTo({ top: 380, behavior: "smooth" });
                  }, 150);
                }}
                className="rounded-full px-14 py-5 text-base font-medium bg-[#000000] text-[#FFFFFF] mt-12 transition-all duration-200 shadow-lg shadow-black/5 cursor-pointer flex items-center space-x-3 group"
              >
                <span>Begin Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
            </div>
          </div>
        </main>
      </div>

      {/* Floating telemetry metrics at bottom right to track state and feel premium without layout noise */}
      <div 
        id="metrics-panel"
        className="fixed bottom-6 right-6 z-20 hidden md:flex items-center space-x-4 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-[#6f6f6f]/15 text-[10px] font-mono text-[#6F6F6F] uppercase tracking-wider"
      >
        <div className="flex items-center space-x-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
          <span>Aethera® Engine</span>
        </div>
        <div className="h-3 w-[1px] bg-[#6F6F6F]/20" />
        <div>Loop status: {videoOpacity > 0 ? "seamless" : "faded"}</div>
        <div className="h-3 w-[1px] bg-[#6F6F6F]/20" />
        <div>
          {playbackTime.toFixed(1)}s / {videoDuration ? videoDuration.toFixed(1) : "0.0"}s
        </div>
        <div className="h-3 w-[1px] bg-[#6F6F6F]/20" />
        <div>PARALLAX: {scrollY > 0 ? `${(scrollY * 0.18).toFixed(0)}PX` : "0PX"}</div>
      </div>
    </div>
  );
}
