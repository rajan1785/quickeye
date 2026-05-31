import {
  COLORS,
  addAccentBar,
  addBackground,
  addConnector,
  addGridWash,
  addPageMark,
  addPanel,
  addText,
  addTitleBlock,
} from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();

  addBackground(slide, ctx, COLORS.emerald, COLORS.blue);
  addGridWash(slide, ctx);

  addTitleBlock(slide, ctx, {
    kicker: "USER JOURNEY",
    title: "QuickEye turns one inspection into a shared record the whole shift can use.",
    note: "The loop works on a phone: capture the unit, classify it, explain the verdict, and save it into a visible history.",
    width: 920,
    titleSize: 44,
    noteWidth: 880,
    noteHeight: 24,
  });

  const startX = 56;
  const startY = 244;
  const boxW = 218;
  const boxH = 216;
  const gap = 12;
  const steps = [
    {
      step: "01",
      title: "Snap unit",
      body: "The inspector opens the camera and captures the product in the moment.",
      detail: "One photo becomes the evidence for the whole decision.",
      fill: "#101725",
      bar: COLORS.emerald,
    },
    {
      step: "02",
      title: "Get verdict",
      body: "The model returns ok, defect, or uncertain with confidence and similarity scores.",
      detail: "The decision is immediate enough for the line.",
      fill: "#121c27",
      bar: COLORS.blue,
    },
    {
      step: "03",
      title: "Read explanation",
      body: "The inspector sees what defect was detected, where it is, and why it matters.",
      detail: "The result is readable instead of hidden in a code.",
      fill: "#111820",
      bar: COLORS.amber,
    },
    {
      step: "04",
      title: "Save history",
      body: "Every result is stored with a timestamp and preview for later review.",
      detail: "The shift gets a searchable memory.",
      fill: "#10181d",
      bar: COLORS.emerald,
    },
    {
      step: "05",
      title: "Review dashboard",
      body: "Owners and QC leads see trends, defect types, and recent failures in one place.",
      detail: "The loop becomes a management tool.",
      fill: "#141522",
      bar: COLORS.blue,
    },
  ];

  steps.forEach((item, index) => {
    const left = startX + index * (boxW + gap);
    addPanel(slide, ctx, {
      left,
      top: startY,
      width: boxW,
      height: boxH,
      fill: item.fill,
      stroke: COLORS.line2,
    });
    addAccentBar(slide, ctx, { left, top: startY, width: boxW, height: 6, fill: item.bar });
    addText(slide, ctx, {
      left: left + 18,
      top: startY + 22,
      width: 52,
      height: 24,
      text: item.step,
      size: 12,
      color: item.bar,
      bold: true,
    });
    addText(slide, ctx, {
      left: left + 18,
      top: startY + 54,
      width: 180,
      height: 34,
      text: item.title,
      size: 22,
      color: COLORS.text,
      bold: true,
      face: ctx.fonts.title,
    });
    addText(slide, ctx, {
      left: left + 18,
      top: startY + 102,
      width: 176,
      height: 58,
      text: item.body,
      size: 15,
      color: COLORS.muted,
    });
    addText(slide, ctx, {
      left: left + 18,
      top: startY + 170,
      width: 176,
      height: 30,
      text: item.detail,
      size: 13,
      color: COLORS.text,
      bold: true,
    });

    if (index < steps.length - 1) {
      addConnector(slide, ctx, {
        left: left + boxW + 2,
        top: startY + 103,
        width: gap - 2,
        height: 4,
        fill: COLORS.emerald,
      });
    }
  });

  addPanel(slide, ctx, {
    left: 56,
    top: 490,
    width: 1168,
    height: 136,
    fill: COLORS.panel,
    stroke: COLORS.line2,
  });
  addAccentBar(slide, ctx, { left: 56, top: 490, width: 1168, height: 4, fill: COLORS.emerald });
  addText(slide, ctx, {
    left: 82,
    top: 520,
    width: 620,
    height: 40,
    text: "One image becomes one decision and one searchable record.",
    size: 24,
    color: COLORS.text,
    bold: true,
    face: ctx.fonts.title,
  });
  addText(slide, ctx, {
    left: 82,
    top: 568,
    width: 720,
    height: 26,
    text: "That makes the product useful both on the shop floor and in the office, because the same inspection output serves both users.",
    size: 17,
    color: COLORS.muted,
  });

  const ribbonY = 524;
  const chips = [
    { left: 858, text: "One photo", fill: "#10b98122", color: COLORS.emerald },
    { left: 972, text: "One verdict", fill: "#3b82f622", color: COLORS.blue },
    { left: 1086, text: "One history", fill: "#f59e0b22", color: COLORS.amber },
  ];
  chips.forEach((chip) => {
    addPanel(slide, ctx, {
      left: chip.left,
      top: ribbonY,
      width: 96,
      height: 34,
      fill: chip.fill,
      stroke: chip.fill,
    });
    addText(slide, ctx, {
      left: chip.left,
      top: ribbonY + 6,
      width: 96,
      height: 18,
      text: chip.text,
      size: 12,
      color: chip.color,
      bold: true,
      align: "center",
      valign: "middle",
    });
  });

  addPageMark(slide, ctx, 2);
  return slide;
}
