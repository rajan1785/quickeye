const COLORS = {
  bg: "#0b0f14",
  panel: "#111827",
  panel2: "#0f172a",
  line: "#ffffff14",
  line2: "#ffffff1f",
  text: "#f4f4f5",
  muted: "#a1a1aa",
  muted2: "#71717a",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#3b82f6",
};

export { COLORS };

export function addBackground(slide, ctx, accentA = COLORS.emerald, accentB = COLORS.amber) {
  ctx.addShape(slide, {
    left: 0,
    top: 0,
    width: ctx.W,
    height: ctx.H,
    fill: COLORS.bg,
    line: ctx.line(COLORS.bg, 0),
  });

  ctx.addShape(slide, {
    left: 0,
    top: 0,
    width: ctx.W,
    height: 5,
    fill: accentA,
    line: ctx.line(accentA, 0),
  });

  ctx.addShape(slide, {
    left: 0,
    top: ctx.H - 1,
    width: ctx.W,
    height: 1,
    fill: COLORS.line,
    line: ctx.line(COLORS.line, 0),
  });
}

export function addGridWash(slide, ctx) {
  for (let x = 72; x < ctx.W; x += 140) {
    ctx.addShape(slide, {
      left: x,
      top: 58,
      width: 1,
      height: ctx.H - 116,
      fill: "#ffffff08",
      line: ctx.line("#ffffff08", 0),
    });
  }
}

export function addKicker(slide, ctx, text, x = 56, y = 36) {
  ctx.addShape(slide, {
    left: x,
    top: y + 4,
    width: 10,
    height: 10,
    fill: COLORS.emerald,
    line: ctx.line(COLORS.emerald, 0),
  });

  ctx.addText(slide, {
    left: x + 18,
    top: y,
    width: 260,
    height: 20,
    text,
    fontSize: 13,
    bold: true,
    color: COLORS.emerald,
    fill: "#00000000",
    line: ctx.line("#00000000", 0),
    typeface: ctx.fonts.body,
    valign: "middle",
  });
}

export function addTitleBlock(
  slide,
  ctx,
  {
    kicker,
    title,
    note,
    left = 56,
    top = 60,
    width = 640,
    titleSize = 48,
    titleHeight = 110,
    noteWidth = 640,
    noteTopOffset = 150,
    noteHeight = 72,
  },
) {
  addKicker(slide, ctx, kicker, left, top);
  ctx.addText(slide, {
    left,
    top: top + 34,
    width,
    height: titleHeight,
    text: title,
    fontSize: titleSize,
    bold: true,
    color: COLORS.text,
    fill: "#00000000",
    line: ctx.line("#00000000", 0),
    typeface: ctx.fonts.title,
    valign: "top",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
  ctx.addText(slide, {
    left,
    top: top + noteTopOffset,
    width: noteWidth,
    height: noteHeight,
    text: note,
    fontSize: 18,
    color: COLORS.muted,
    fill: "#00000000",
    line: ctx.line("#00000000", 0),
    typeface: ctx.fonts.body,
    valign: "top",
    insets: { left: 0, right: 0, top: 0, bottom: 0 },
  });
}

export function addPanel(slide, ctx, { left, top, width, height, fill = COLORS.panel, stroke = COLORS.line2, strokeWidth = 1, name }) {
  return ctx.addShape(slide, {
    left,
    top,
    width,
    height,
    fill,
    line: { style: "solid", fill: stroke, width: strokeWidth },
    name,
  });
}

export function addText(slide, ctx, { left, top, width, height, text, size = 18, color = COLORS.text, bold = false, align = "left", valign = "top", face, fill = "#00000000", insets = { left: 0, right: 0, top: 0, bottom: 0 }, name }) {
  return ctx.addText(slide, {
    left,
    top,
    width,
    height,
    text,
    fontSize: size,
    color,
    bold,
    align,
    valign,
    face: face || ctx.fonts.body,
    fill,
    line: ctx.line("#00000000", 0),
    insets,
    name,
  });
}

export function addAccentBar(slide, ctx, { left, top, width, height, fill }) {
  return ctx.addShape(slide, {
    left,
    top,
    width,
    height,
    fill,
    line: ctx.line(fill, 0),
  });
}

export function addPageMark(slide, ctx, index) {
  const text = `${String(index).padStart(2, "0")} / 04`;
  addText(slide, ctx, {
    left: ctx.W - 120,
    top: ctx.H - 38,
    width: 72,
    height: 18,
    text,
    size: 11,
    color: COLORS.muted2,
    align: "right",
  });
}

export function addLabelChip(slide, ctx, { left, top, width, text, fill, color = COLORS.text }) {
  addPanel(slide, ctx, {
    left,
    top,
    width,
    height: 28,
    fill,
    stroke: fill,
  });
  addText(slide, ctx, {
    left,
    top: top + 3,
    width,
    height: 20,
    text,
    size: 12,
    color,
    bold: true,
    align: "center",
    valign: "middle",
  });
}

export function addConnector(slide, ctx, { left, top, width, height, fill = COLORS.emerald }) {
  return ctx.addShape(slide, {
    left,
    top,
    width,
    height,
    fill,
    line: ctx.line(fill, 0),
  });
}
