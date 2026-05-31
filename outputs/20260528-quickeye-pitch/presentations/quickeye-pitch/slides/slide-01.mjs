import {
  COLORS,
  addAccentBar,
  addBackground,
  addGridWash,
  addConnector,
  addLabelChip,
  addPageMark,
  addPanel,
  addText,
  addTitleBlock,
} from "./common.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();

  addBackground(slide, ctx, COLORS.red, COLORS.amber);
  addGridWash(slide, ctx);

  addTitleBlock(slide, ctx, {
    kicker: "PAIN POINT",
    title: "Inspection still breaks when the evidence lives in too many places.",
    note: "Photos, chat messages, and memory do not give owners a clean view of defects, timing, or repeat patterns.",
    width: 540,
    titleSize: 44,
    titleHeight: 130,
    noteWidth: 520,
    noteTopOffset: 210,
    noteHeight: 56,
  });

  addPanel(slide, ctx, {
    left: 56,
    top: 404,
    width: 520,
    height: 178,
    fill: COLORS.panel,
    stroke: COLORS.line2,
  });
  addAccentBar(slide, ctx, { left: 56, top: 404, width: 4, height: 178, fill: COLORS.red });
  addText(slide, ctx, {
    left: 78,
    top: 432,
    width: 448,
    height: 50,
    text: "Without a shared record, every shift starts from memory.",
    size: 22,
    bold: true,
    color: COLORS.text,
    face: ctx.fonts.title,
  });
  addText(slide, ctx, {
    left: 78,
    top: 492,
    width: 448,
    height: 56,
    text: "That makes it hard to see whether the same defect keeps returning, which units were checked, or whether a pattern is spreading across the line.",
    size: 18,
    color: COLORS.muted,
  });

  addPanel(slide, ctx, {
    left: 636,
    top: 124,
    width: 588,
    height: 462,
    fill: COLORS.panel2,
    stroke: COLORS.line2,
  });
  addText(slide, ctx, {
    left: 664,
    top: 146,
    width: 240,
    height: 24,
    text: "HOW THE FAILURE HAPPENS",
    size: 12,
    color: COLORS.amber,
    bold: true,
  });
  addText(slide, ctx, {
    left: 664,
    top: 176,
    width: 420,
    height: 48,
    text: "The defect is not just the defect. The problem is the broken chain from sight to decision to record.",
    size: 21,
    color: COLORS.text,
    bold: true,
    face: ctx.fonts.title,
  });

  const chainX = 664;
  const chainW = 532;
  const boxH = 82;
  const gap = 10;
  const startY = 228;
  const chain = [
    {
      title: "Manual spot check",
      body: "One person inspects a unit, but context stays in their head.",
      fill: "#151b24",
      bar: COLORS.amber,
    },
    {
      title: "Photo in chat",
      body: "Evidence gets sent around, but it is not structured for later review.",
      fill: "#131a22",
      bar: COLORS.red,
    },
    {
      title: "No shared history",
      body: "The next shift cannot easily compare, search, or trend what happened.",
      fill: "#101725",
      bar: COLORS.blue,
    },
    {
      title: "Defect escapes",
      body: "The line keeps moving while the pattern remains invisible to owners.",
      fill: "#201017",
      bar: COLORS.red,
    },
  ];

  chain.forEach((item, index) => {
    const top = startY + index * (boxH + gap);
    addPanel(slide, ctx, {
      left: chainX,
      top,
      width: chainW,
      height: boxH,
      fill: item.fill,
      stroke: COLORS.line2,
    });
    addAccentBar(slide, ctx, { left: chainX, top, width: 6, height: boxH, fill: item.bar });
    addLabelChip(slide, ctx, {
      left: chainX + 18,
      top: top + 14,
      width: 150,
      text: `0${index + 1}`,
      fill: `${item.bar}24`,
      color: item.bar,
    });
    addText(slide, ctx, {
      left: chainX + 182,
      top: top + 12,
      width: 312,
      height: 22,
      text: item.title,
      size: 18,
      color: COLORS.text,
      bold: true,
    });
    addText(slide, ctx, {
      left: chainX + 182,
      top: top + 38,
      width: 312,
      height: 28,
      text: item.body,
      size: 12,
      color: COLORS.muted,
    });

    if (index < chain.length - 1) {
      addConnector(slide, ctx, {
        left: chainX + 260,
        top: top + boxH + 3,
        width: 12,
        height: gap - 4,
        fill: "#ffffff22",
      });
    }
  });

  addPanel(slide, ctx, {
    left: 636,
    top: 594,
    width: 588,
    height: 60,
    fill: "#0f1720",
    stroke: COLORS.line2,
  });
  addText(slide, ctx, {
    left: 662,
    top: 608,
    width: 532,
    height: 28,
    text: "The result is not just missed quality. It is a weak operating memory for the whole factory.",
    size: 18,
    color: COLORS.text,
  });

  addPageMark(slide, ctx, 1);
  return slide;
}
