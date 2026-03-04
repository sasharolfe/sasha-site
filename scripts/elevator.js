import { drawGate, animateGate, gateProgress } from './gate.js';
import { buildDial, setDialNeedle, floorToDeg } from './dial.js';

export const FLOORS = [
    {id: 1, label: 'Welcome'},
    {id: 2, label: 'About'},
    {id: 3, label: 'Projects'},
    {id: 4, label: 'Contact'},
    {id: 5, label: 'Mystery'},
];
export const TOTAL = FLOORS.length;

const GATE_MAX_OPEN_PERCENT = 0.90;
const GATE_CLOSE_MS = 700;
const GATE_OPEN_MS = 700;

export let currentFloor = 1;

const shaftScroll = document.getElementById('shaft-scroll');
const buttons = document.querySelectorAll('.floor-btn');
const sections = document.querySelectorAll('.section');

if (!shaftScroll) {
    console.warn('elevator.js: #shaft-scroll not found in DOM — aborting init.');
}

export function syncSectionHeights() {
    if (!shaftScroll) return;
    const h = shaftScroll.clientHeight;
    sections.forEach(s => { s.style.height = h + 'px'; });
}

function getScrollTopForFloor(floor) {
    const section = document.getElementById('section-' + floor);
    if (!section) return 0;
    return section.offsetTop - (shaftScroll.clientHeight - section.clientHeight);
}

function scrollToFloor(floor) {
    return new Promise(resolve => {
        const target = getScrollTopForFloor(floor);
        shaftScroll.scrollTo({ top: target, behavior: 'smooth' });

        let last = -1;
        let stableCount = 0;
        function check() {
            const cur = shaftScroll.scrollTop;
            if (Math.abs(cur - target) < 0.6) {
                resolve(); return;
            }
            if (Math.abs(cur - last) < 0.5) stableCount++; else stableCount = 0;
            last = cur;
            if (stableCount >= 6) { resolve(); return; }
            setTimeout(check, 60);
        }
        setTimeout(check, 120);
    });
}

export function renderButtons() {
    buttons.forEach(b => {
        const f = parseInt(b.dataset.floor, 10);
        b.classList.toggle('active', travelFloor !== null && f === travelFloor);
    });
}

let isMoving = false;
let travelFloor = null;
export async function navigate(floor) {
    if (isMoving || floor === currentFloor) return;
    isMoving = true;
    currentFloor = floor;
    travelFloor = floor;
    renderButtons();

    await animateGate(0, GATE_CLOSE_MS);
    await scrollToFloor(floor);
    setDialNeedle(floorToDeg(floor));
    await animateGate(GATE_MAX_OPEN_PERCENT, GATE_OPEN_MS);

    travelFloor = null;
    renderButtons();
    isMoving = false;
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const f = parseInt(btn.dataset.floor, 10);
        if (!Number.isNaN(f)) navigate(f);
    });
});

if (shaftScroll) {
    shaftScroll.addEventListener('scroll', () => {
        const maxScroll = shaftScroll.scrollHeight - shaftScroll.clientHeight;
        if (maxScroll <= 0) return;

        const frac = shaftScroll.scrollTop / maxScroll;
        const fracFloor = TOTAL - frac * (TOTAL - 1);
        setDialNeedle(floorToDeg(fracFloor)); // was floorToDeg(floor) — undefined variable

        const nearest = Math.round(Math.max(1, Math.min(TOTAL, fracFloor)));
        if (nearest !== currentFloor) {
            currentFloor = nearest;
            renderButtons();
        }
    });
}

export function init() {
    syncSectionHeights();
    buildDial();
    drawGate(GATE_MAX_OPEN_PERCENT);
    const bottom = Math.max(0, shaftScroll.scrollHeight - shaftScroll.clientHeight);
    shaftScroll.scrollTop = bottom;
    renderButtons();
    setDialNeedle(floorToDeg(1));
}

window.addEventListener('resize', () => {
    syncSectionHeights();
    buildDial();
    if (shaftScroll) shaftScroll.scrollTop = getScrollTopForFloor(currentFloor);
    setDialNeedle(floorToDeg(currentFloor));
    drawGate(gateProgress);
});