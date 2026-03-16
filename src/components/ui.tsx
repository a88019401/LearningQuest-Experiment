import React from "react";


export const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }>
= ({ active, onClick, children }) => (
<button onClick={onClick} className={`whitespace-nowrap px-4 py-2 rounded-2xl text-sm font-medium border transition-all duration-200 ${active ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-[0_4px_10px_-2px_rgba(99,102,241,0.5)] transform -translate-y-0.5" : "bg-white/80 backdrop-blur-sm border-neutral-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5 text-neutral-600"}`}>
{children}
</button>
);


export const Card: React.FC<{ children: React.ReactNode; className?: string }>
= ({ children, className }) => (
<div className={`rounded-3xl border border-white/60 bg-white/70 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 p-5 ${className ?? ""}`}>{children}</div>
);


export const SectionTitle: React.FC<{ title: string; desc?: string }>
= ({ title, desc }) => (
<div className="mb-3">
<h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
{desc && <p className="text-sm text-neutral-500">{desc}</p>}
</div>
);