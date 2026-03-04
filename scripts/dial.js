const ns = "http://www.w3.org/2000/svg";

const TOTAL_FLOORS = 5;
const DIAL_CY = 70;
const DIAL_R = 50;
const MASK_PAD = 5;

let dialAngleDeg = null;
let needleGroup = null;
let dialCX = null;

const dialSvgNode = document.getElementById("dial-svg");

const LABEL_STEP_DEG = 180 / TOTAL_FLOORS;
const LABEL_START_DEG = 180 - LABEL_STEP_DEG / 2;

export function floorToDeg(floor) {
  return LABEL_START_DEG - (floor - 1) * LABEL_STEP_DEG;
}

function svgNode(tag, attrs) {
  const node = document.createElementNS(ns, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export function buildDial() {
  dialSvgNode.innerHTML = "";

  const containerW = dialSvgNode.parentElement.clientWidth;
  const containerH = dialSvgNode.parentElement.clientHeight;
  dialSvgNode.setAttribute("viewBox", `0 0 ${containerW} ${containerH}`);

  const r = DIAL_R;
  const mr = r + MASK_PAD;
  const cx = containerW / 2;
  const cy = DIAL_CY;

  const rOuter = r - 2;
  const rInner = r - 16;
  const rMid = (rOuter + rInner) / 2;

  const degToPoint = (deg, radius) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };

  const defs = svgNode("defs", {});

  const clipId = "d-semi-clip";
  const clip = svgNode("clipPath", { id: clipId });
  clip.appendChild(
    svgNode("path", {
      d: `M ${cx - r - 2} ${cy} A ${r + 2} ${r + 2} 0 0 1 ${
        cx + r + 2
      } ${cy} Z`,
    })
  );
  defs.appendChild(clip);

  dialSvgNode.appendChild(defs);

  const lx = cx - mr,
    rx = cx + mr;
  dialSvgNode.appendChild(
    svgNode("path", {
      d: `M 0 0 H ${containerW} V 88 H 0 Z M ${rx} ${cy} A ${mr} ${mr} 0 0 0 ${lx} ${cy} Z`,
      fill: "currentColor",
      "fill-rule": "evenodd",
      stroke: "none",
    })
  );

  const outerL = degToPoint(180, rOuter);
  const outerR = degToPoint(0, rOuter);
  const innerL = degToPoint(180, rInner);
  const innerR = degToPoint(0, rInner);

  dialSvgNode.appendChild(
    svgNode("path", {
      d: `M ${outerL.x} ${outerL.y}
            A ${rOuter} ${rOuter} 0 0 1 ${outerR.x} ${outerR.y}
            L ${innerR.x} ${innerR.y}
            A ${rInner} ${rInner} 0 0 0 ${innerL.x} ${innerL.y}
            Z`,
      fill: "#f9edca",
      stroke: "none",
    })
  );

  const p1 = degToPoint(180, r),
    p5 = degToPoint(0, r);
  dialSvgNode.appendChild(
    svgNode("path", {
      d: `M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p5.x} ${p5.y}`,
      fill: "none",
      stroke: "black",
      "stroke-width": "2.6",
    })
  );
  dialSvgNode.appendChild(
    svgNode("line", {
      x1: p1.x,
      y1: p1.y,
      x2: p5.x,
      y2: p5.y,
      stroke: "black",
      "stroke-width": "2.0",
    })
  );
  dialSvgNode.appendChild(
    svgNode("path", {
      d: `M ${innerL.x} ${innerL.y} A ${rInner} ${rInner} 0 0 1 ${innerR.x} ${innerR.y}`,
      fill: "none",
      stroke: "black",
      "stroke-width": "2.0",
    })
  );

  const gPetals = svgNode("g", { "clip-path": `url(#${clipId})` });
  dialSvgNode.appendChild(gPetals);

  const PETAL_LEN = rInner - 1;
  const PETAL_WIDTH = PETAL_LEN * 0.3;

  for (let f = 1; f <= TOTAL_FLOORS; f++) {
    const deg = floorToDeg(f);
    const rad = (deg * Math.PI) / 180;
    const tx = cx + PETAL_LEN * Math.cos(rad);
    const ty = cy - PETAL_LEN * Math.sin(rad);
    const perpRad = rad + Math.PI / 2;
    const px = Math.cos(perpRad) * PETAL_WIDTH;
    const py = -Math.sin(perpRad) * PETAL_WIDTH;
    const cpFrac = 0.52;
    const ax = cx + PETAL_LEN * cpFrac * Math.cos(rad);
    const ay = cy - PETAL_LEN * cpFrac * Math.sin(rad);

    gPetals.appendChild(
      svgNode("path", {
        d: `M ${cx} ${cy}
                C ${ax + px} ${ay + py} ${tx} ${ty} ${tx} ${ty}
                C ${tx} ${ty} ${ax - px} ${ay - py} ${cx} ${cy} Z`,
        fill: "none",
        stroke: "black",
        "stroke-width": "2.0",
        "stroke-linejoin": "round",
      })
    );
  }

  needleGroup = svgNode("g", {});
  const needleLen = r - 15;
  needleGroup.appendChild(
    svgNode("line", {
      x1: cx,
      y1: cy + 3,
      x2: cx,
      y2: cy - needleLen,
      stroke: "#fdc279",
      "stroke-width": "3.0",
      "stroke-linecap": "round",
    })
  );
  dialSvgNode.appendChild(needleGroup);

  dialSvgNode.appendChild(
    svgNode("circle", {
      cx: cx,
      cy: cy,
      r: "4.5",
      fill: "black",
      stroke: "#fdc279",
      "stroke-width": "1.2",
    })
  );

  for (let f = 1; f <= TOTAL_FLOORS; f++) {
    const deg = floorToDeg(f);
    const lp = degToPoint(deg, rMid);
    const rot = 90 - deg;

    const txt = svgNode("text", {
      x: lp.x,
      y: lp.y,
      "text-anchor": "middle",
      "dominant-baseline": "middle",
      "font-family": "Arial, Helvetica, sans-serif",
      "font-size": "11",
      "font-weight": "normal",
      transform: `rotate(${rot} ${lp.x} ${lp.y})`,
      "data-floor-label": f,
    });
    txt.textContent = f;
    dialSvgNode.appendChild(txt);
  }

  dialCX = cx;
  setDialNeedle(dialAngleDeg);
}

export function setDialNeedle(deg) {
  dialAngleDeg = deg;
  if (!needleGroup) return;

  needleGroup.setAttribute(
    "transform",
    `rotate(${90 - deg} ${dialCX} ${DIAL_CY})`
  );

  const isClose = (f) => Math.abs(floorToDeg(f) - deg) < LABEL_STEP_DEG / 2;

  dialSvgNode.querySelectorAll("[data-floor-label]").forEach((el) => {
    const floor = +el.getAttribute("data-floor-label");

    if (isClose(floor)) {
      el.setAttribute("font-weight", "bold");
      el.setAttribute("fill", "black");
    } else {
      el.setAttribute("font-weight", "normal");
      el.setAttribute("fill", "dimgray");
    }
  });
}
