import confetti from 'canvas-confetti';

export function triggerConfetti(accentColor: string = '#6366f1') {
    const duration = 2000;
    const end = Date.now() + duration;

    // Use the accent color along with some festive defaults
    const colors = [accentColor, '#ffffff', '#FFD700'];

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: colors,
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: colors,
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
}
