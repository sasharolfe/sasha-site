const ns = 'http://www.w3.org/2000/svg';
const NUM_BARS = 14;
const BAR_W = 6.0;

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

    for (const x of bars) {
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', x.toFixed(2));
        line.setAttribute('y1', '0');
        line.setAttribute('x2', x.toFixed(2));
        line.setAttribute('y2', H.toFixed(2));
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', BAR_W);
        gateSvgNode.appendChild(line);
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