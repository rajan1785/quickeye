import {
  COLORS,
  addAccentBar,
  addBackground,
  addGridWash,
  addPageMark,
  addPanel,
  addText,
  addTitleBlock,
} from "./common.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();

  addBackground(slide, ctx, COLORS.blue, COLORS.emerald);
  addGridWash(slide, ctx);

  addTitleBlock(slide, ctx, {
    kicker: "TECH STACK",
    title: "A client-first stack keeps the workflow fast on-device and easy to extend.",
    note: "The deck leans on the existing app pattern: client components, localStorage history, and client-rendered analytics.",
    width: 920,
    titleSize: 42,
    noteWidth: 900,
    noteTopOffset: 150,
    noteHeight: 24,
  });

  const layers = [
    {
      label: "Capture layer",
      title: "Next.js App Router + React client components + Capacitor camera",
      body: "The inspection flow starts in the browser or mobile wrapper, so the same UI can serve a phone-first shop floor experience.",
      fill: "#101725",
      bar: COLORS.emerald,
    },
    {
      label: "Inspection layer",
      title: "Verdict payload, confidence, similarity scores, and explanation fields",
      body: "The product keeps the result readable and structured, which makes the verdict easy to show, store, and reuse.",
      fill: "#121c27",
      bar: COLORS.blue,
    },
    {
      label: "Data layer",
      title: "localStorage history with timestamped entries and hydration-safe state",
      body: "The dashboard reads only existing inspection data, so analytics work without changing the backend.",
      fill: "#10181d",
      bar: COLORS.amber,
    },
    {
      label: "Analytics layer",
      title: "Recharts, summary cards, and trend views for operational review",
      body: "The same history powers KPI tiles, weekly trends, defect breakdowns, and the shift summary card.",
      fill: "#131522",
      bar: COLORS.emerald,
    },
  ];

  const x = 56;
  const y = 244;
  const w = 770;
  const h = 82;
  const gap = 12;

  layers.forEach((layer, index) => {
    const top = y + index * (h + gap);
    addPanel(slide, ctx, {
      left: x,
      top,
      width: w,
      height: h,
      fill: layer.fill,
      stroke: COLORS.line2,
    });
    addAccentBar(slide, ctx, { left: x, top, width: 6, height: h, fill: layer.bar });
    addText(slide, ctx, {
      left: x + 22,
      top: top + 12,
      width: 180,
      height: 18,
      text: layer.label,
      size: 11,
      color: layer.bar,
      bold: true,
    });
    addText(slide, ctx, {
      left: x + 22,
      top: top + 34,
      width: 704,
      height: 20,
      text: layer.title,
      size: 16,
      color: COLORS.text,
      bold: true,
    });
    addText(slide, ctx, {
      left: x + 22,
      top: top + 56,
      width: 712,
      height: 18,
      text: layer.body,
      size: 12,
      color: COLORS.muted,
    });
  });

  addPanel(slide, ctx, {
    left: 860,
    top: 244,
    width: 364,
    height: 404,
    fill: COLORS.panel2,
    stroke: COLORS.line2,
  });
  addText(slide, ctx, {
    left: 886,
    top: 246,
    width: 220,
    height: 24,
    text: "WHY THIS STACK WORKS",
    size: 12,
    color: COLORS.amber,
    bold: true,
  });
  addText(slide, ctx, {
    left: 886,
    top: 274,
    width: 280,
    height: 74,
    text: "The product stays lightweight for the floor while still giving management a clean analytics surface.",
    size: 18,
    color: COLORS.text,
    bold: true,
    face: ctx.fonts.title,
  });

  const bullets = [
    { top: 356, title: "Low friction", body: "No extra hardware or separate analytics system is needed for the first version." },
    { top: 418, title: "Portable", body: "The same UI can run in browser, on mobile, or in a wrapped app shell." },
    { top: 480, title: "Fast feedback", body: "Client-side history and charts keep the loop responsive during inspections." },
    { top: 542, title: "Easy to extend", body: "The structured result object leaves room for richer reporting later." },
  ];

  bullets.forEach((bullet, index) => {
    addAccentBar(slide, ctx, {
      left: 886,
      top: bullet.top + 5,
      width: 10,
      height: 10,
      fill: [COLORS.emerald, COLORS.blue, COLORS.amber, COLORS.red][index],
    });
    addText(slide, ctx, {
      left: 906,
      top: bullet.top,
      width: 270,
      height: 18,
      text: bullet.title,
      size: 16,
      color: COLORS.text,
      bold: true,
    });
    addText(slide, ctx, {
      left: 906,
      top: bullet.top + 20,
      width: 270,
      height: 30,
      text: bullet.body,
      size: 12,
      color: COLORS.muted,
    });
  });

  addPanel(slide, ctx, {
    left: 56,
    top: 656,
    width: 1168,
    height: 32,
    fill: "#0f1720",
    stroke: COLORS.line2,
  });
  addText(slide, ctx, {
    left: 76,
    top: 662,
    width: 1128,
    height: 18,
    text: "The analytics dashboard can be built entirely from existing inspection history, so the product story stays client-first instead of backend-heavy.",
    size: 12,
    color: COLORS.muted2,
  });

  addPageMark(slide, ctx, 3);
  return slide;
}
