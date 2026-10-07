import React from 'react';

interface PhysicsGraphicProps {
  type?: 'hero' | 'wave' | 'pendulum' | 'atom' | 'circuit';
  className?: string;
}

export const PhysicsGraphic: React.FC<PhysicsGraphicProps> = ({ type = 'hero', className = '' }) => {
  if (type === 'hero') {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-blue-900 p-8 text-white shadow-xl ${className}`}>
        {/* Background Grid & Physics Curves */}
        <svg
          className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="physicsGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#physicsGrid)" />
          {/* Sine wave */}
          <path
            d="M 0 120 Q 80 40, 160 120 T 320 120 T 480 120 T 640 120 T 800 120"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
          <path
            d="M 0 140 Q 80 220, 160 140 T 320 140 T 480 140 T 640 140 T 800 140"
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
          />
        </svg>

        {/* Content & Visual Physics Elements */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
              <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>Chương trình Giáo dục Phổ thông Vật lý 11</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              LUYỆN TẬP MÔN VẬT LÝ CHUYÊN ĐỀ 11
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Nền tảng kiểm tra trực tuyến chuẩn hóa: Dao động điều hòa, Sóng cơ, Điện trường & Từ trường. Hệ thống tự động chấm điểm, hiển thị lời giải chi tiết và phân tích dữ liệu chuyên sâu.
            </p>
          </div>

          {/* Interactive Physics Model Showcase */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-4 text-center min-w-[130px]">
              <div className="text-2xl font-mono font-bold text-sky-300">x = A cos(ωt)</div>
              <span className="text-xs text-slate-300 mt-1">Dao động cơ</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-4 text-center min-w-[130px]">
              <div className="text-2xl font-mono font-bold text-indigo-300">λ = v · T</div>
              <span className="text-xs text-slate-300 mt-1">Sóng cơ học</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-4 text-center min-w-[130px]">
              <div className="text-2xl font-mono font-bold text-emerald-300">F = k|q₁q₂|/r²</div>
              <span className="text-xs text-slate-300 mt-1">Điện trường tĩnh</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
