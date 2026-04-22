import React from "react";
import { Shield } from "lucide-react";

interface LoadingPageProps {
  message?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = "Initialisation du Système",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.05)_0%,_transparent_70%)]" />

      <div className="relative flex flex-col items-center">
        {/* Animated logo container */}
        <div className="relative">
          {/* Pulsing ring layers */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping duration-[3000ms]" />
          <div className="absolute inset-0 rounded-full bg-cyan-400/10 animate-pulse duration-[2000ms]" />

          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 animate-in zoom-in duration-700">
            <Shield className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
        </div>

        <div className="mt-8 text-center animate-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-2xl font-bold text-white tracking-tighter mb-2">
            AEGIS AI
          </h1>
          <div className="flex items-center gap-2 justify-center">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" />
            </div>
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-[0.2em]">
              {message}
            </span>
          </div>
        </div>
      </div>

      {/* Version badge at footer */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-gray-700 font-bold tracking-widest uppercase">
        V2.4 :: SECURE PROTOCOL ACTIVE
      </div>
    </div>
  );
};
