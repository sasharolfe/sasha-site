const ns = 'http://www.w3.org/2000/svg';
const NUM_BARS = 14;
const BAR_W = 6.0;
const ARM_W = 5.5;
const ROW_FRACS = [0.2, 0.5, 0.8];

const gateSvgNode = document.getElementById('svg-gate');

export let gateProgress = 0;

export function drawGate(progress) {
    gateProgress = progress;
    const W = gateSvgNode.clientWidth;
    const H = gateSvgNode.clientHeight;
    if (!W || !H) return;

    gateSvgNode.innerHTML = '';

    const maxSpacing = (W - BAR_W) / (NUM_BARS - 1);
    const spacing = maxSpacing * (1 - progress);
    const bars = Array.from({ length: NUM_BARS }, (_, i) => W - i * spacing - BAR_W / 2);

    const armLen = maxSpacing * 1.3;

    function make_line(group, x1, y1, x2, y2, sw) {
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', x1.toFixed(2)); line.setAttribute('y1', y1.toFixed(2));
        line.setAttribute('x2', x2.toFixed(2)); line.setAttribute('y2', y2.toFixed(2));
        line.setAttribute('stroke', 'currentColor');
        line.setAttribute('stroke-width', sw);
        line.setAttribute('stroke-linecap', 'round');
        group.appendChild(line);
    }

    function drawXsBetween(xRightBar, xLeftBar) {
        const halfWidth = (xRightBar - xLeftBar) / 2;
        const halfHeight = Math.sqrt(
            Math.max(0, armLen * armLen - halfWidth * halfWidth)
        );

        for (const frac of ROW_FRACS) {
            const cy = H * frac;

            make_line(gateSvgNode, xLeftBar, cy - 2 * halfHeight, xRightBar, cy, ARM_W);
            make_line(gateSvgNode, xRightBar, cy - 2 * halfHeight, xLeftBar, cy, ARM_W);
            make_line(gateSvgNode, xLeftBar, cy, xRightBar, cy + 2 * halfHeight, ARM_W);
            make_line(gateSvgNode, xRightBar, cy, xLeftBar, cy + 2 * halfHeight, ARM_W);
        }
    }

    for (const x of bars) make_line(gateSvgNode, x, 0, x, H, BAR_W);
    for (let i = 0; i < NUM_BARS - 1; i++) {
        drawXsBetween(bars[i], bars[i + 1]);
    }
}

export function animateGate(openPercentage, duration) {
    return new Promise(resolve => {
        const startPercentage  = gateProgress;
        const startTime = performance.now();
        function tick(now) {
            const t = Math.min((now - startTime) / duration, 1);
            const e = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
            drawGate(startPercentage + (openPercentage - startPercentage) * e);
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
        }
        requestAnimationFrame(tick);
    });
}