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

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();

  addBackground(slide, ctx, COLORS.amber, COLORS.emerald);
  addGridWash(slide, ctx);

  addTitleBlock(slide, ctx, {
    kicker: "TARGET AUDIENCE",
    title: "Factory owners buy the signal, while QC and line teams use it every day.",
    note: "QuickEye is strongest where visual inspection is still manual and the result needs to survive a shift handoff.",
    width: 960,
    titleSize: 44,
    noteWidth: 880,
    noteTopOffset: 150,
    noteHeight: 24,
  });

  const cards = [
    {
      left: 56,
      title: "Factory owners",
      band: COLORS.amber,
      body: "They want margin protection, defect trends, and evidence that quality is improving rather than just being discussed.",
      bullets: ["Buyer / sponsor", "Wants clean visibility", "Needs rollout confidence"],
      fill: "#111820",
    },
    {
      left: 442,
      title: "QC and plant managers",
      band: COLORS.emerald,
      body: "They run the review loop, check patterns across shifts, and make sure the inspection record is easy to trust.",
      bullets: ["Primary daily user", "Needs fast review", "Uses the history view"],
      fill: "#101725",
    },
    {
      left: 828,
      title: "Line supervisors",
      band: COLORS.blue,
      body: "They need quick capture, a clear verdict, and a simple path for reporting defects during the shift.",
      bullets: ["Operational user", "Needs speed", "Acts on the result"],
      fill: "#121622",
    },
  ];

  cards.forEach((card) => {
    addPanel(slide, ctx, {
      left: card.left,
      top: 244,
      width: 356,
      height: 226,
      fill: card.fill,
      stroke: COLORS.line2,
    });
    addAccentBar(slide, ctx, { left: card.left, top: 244, width: 356, height: 6, fill: card.band });
    addText(slide, ctx, {
      left: card.left + 22,
      top: 268,
      width: 240,
      height: 24,
      text: card.title,
      size: 23,
      color: COLORS.text,
      bold: true,
      face: ctx.fonts.title,
    });
    addText(slide, ctx, {
      left: card.left + 22,
      top: 314,
      width: 300,
      height: 58,
      text: card.body,
      size: 15,
      color: COLORS.muted,
    });
    card.bullets.forEach((bullet, index) => {
      addAccentBar(slide, ctx, {
        left: card.left + 22,
        top: 386 + index * 18,
        width: 8,
        height: 8,
        fill: card.band,
      });
      addText(slide, ctx, {
        left: card.left + 38,
        top: 380 + index * 18,
        width: 286,
        height: 18,
        text: bullet,
        size: 12,
        color: COLORS.text,
      });
    });
  });

  addPanel(slide, ctx, {
    left: 56,
    top: 494,
    width: 1168,
    height: 118,
    fill: COLORS.panel,
    stroke: COLORS.line2,
  });
  addAccentBar(slide, ctx, { left: 56, top: 494, width: 1168, height: 4, fill: COLORS.amber });
  addText(slide, ctx, {
    left: 82,
    top: 522,
    width: 360,
    height: 18,
    text: "Best first rollout",
    size: 12,
    color: COLORS.amber,
    bold: true,
  });
  addText(slide, ctx, {
    left: 82,
    top: 544,
    width: 660,
    height: 34,
    text: "Start with one line, one QC lead, and one factory owner who needs a cleaner operating signal from inspection history.",
    size: 21,
    color: COLORS.text,
    bold: true,
    face: ctx.fonts.title,
  });

  const badges = [
    { left: 878, text: "Buyer", fill: "#f59e0b22", color: COLORS.amber },
    { left: 996, text: "Daily user", fill: "#10b98122", color: COLORS.emerald },
    { left: 1122, text: "Rollout path", fill: "#3b82f622", color: COLORS.blue },
  ];
  badges.forEach((badge) => {
    addPanel(slide, ctx, {
      left: badge.left,
      top: 526,
      width: 98,
      height: 32,
      fill: badge.fill,
      stroke: badge.fill,
    });
    addText(slide, ctx, {
      left: badge.left,
      top: 532,
      width: 98,
      height: 18,
      text: badge.text,
      size: 12,
      color: badge.color,
      bold: true,
      align: "center",
      valign: "middle",
    });
  });

  addPageMark(slide, ctx, 4);
  return slide;
}
