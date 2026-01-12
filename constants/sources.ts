
export interface TrustedSource {
  name: string;
  domain: string;
  aliases: string[];
  priority: number;
  icon: string;
  color: string;
  watchPathPattern: string; // نمط المسار الذي يدل على صفحة المشاهدة
}

export const TRUSTED_ARABIC_SOURCES: TrustedSource[] = [
  {
    name: "آي واتش (جديد)",
    domain: "iwaatch.com",
    aliases: ["iwaatch", "i-watch", "iwaatch.com"],
    priority: 1,
    icon: "👀",
    color: "text-blue-500 border-blue-500",
    watchPathPattern: "/view/"
  },
  {
    name: "وي سيما (الأصلي)",
    domain: "wecima.show",
    aliases: ["wecima", "mycima", "my-cima", "wecima.cc", "wecima.top"],
    priority: 1,
    icon: "🎬",
    color: "text-emerald-500 border-emerald-500",
    watchPathPattern: "/watch/"
  },
  {
    name: "سيما وبس",
    domain: "cimawbas.tv",
    aliases: ["cimawbas", "cema-w-bas", "cimawbas.site"],
    priority: 1,
    icon: "⚡",
    color: "text-red-500 border-red-500",
    watchPathPattern: "/watch/"
  },
  {
    name: "أكوام (النشط)",
    domain: "akwam.re",
    aliases: ["akwam", "akw.am", "akwam.net", "akwam.cx"],
    priority: 2,
    icon: "💎",
    color: "text-sky-500 border-sky-500",
    watchPathPattern: "/movie/"
  },
  {
    name: "فاصل إتش دي",
    domain: "faselhd.center",
    aliases: ["faselhd", "fasel-hd", "faselhd.top"],
    priority: 2,
    icon: "🎞️",
    color: "text-indigo-500 border-indigo-500",
    watchPathPattern: "/movies/"
  },
  {
    name: "إيجي بست (الأصلي)",
    domain: "egybest.mx",
    aliases: ["egybest", "egy-best", "egybest.run", "egybest.news"],
    priority: 3,
    icon: "🔥",
    color: "text-amber-500 border-amber-500",
    watchPathPattern: "/movie/"
  }
];
