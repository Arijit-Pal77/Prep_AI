/**
 * 🐶 ROBO DOG ASSISTANT ENGINE
 * Modular character system for engagement & onboarding.
 */

const DOG_CONFIG = {
    LERP_SPEED: 0.08,
    MINI_LERP_SPEED: 0.12,
    IDLE_TIMEOUT: 5000,
    CLICK_COOLDOWN: 800,
    FPS: 60,
    PROXIMITY_THRESHOLD: 150,
    STATES: {
        IDLE: 'IDLE',
        FOLLOW: 'FOLLOW',
        EXCITED: 'EXCITED',
        BARKING: 'BARKING',
        SLEEPY: 'SLEEPY',
        RETURNING: 'RETURNING'
    }
};

class RoboDog {
    constructor() {
        this.container = null;
        this.state = DOG_CONFIG.STATES.IDLE;
        this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.lastMoveTime = Date.now();
        this.lastClickTime = 0;
        this.isAssistantMode = false;
        this.animationId = null;
        this.lastFrameTime = 0;
        
        this.init();
    }

    init() {
        // Create container if it doesn't exist
        let portal = document.getElementById('robo-dog-portal');
        if (!portal) {
            portal = document.createElement('div');
            portal.id = 'robo-dog-portal';
            document.body.prepend(portal);
        }

        portal.innerHTML = `
            <button id="skip-intro-btn">Skip Intro</button>
            <div id="robo-dog-container">
                <div id="dog-tooltip">Click me to start!</div>
                <div class="dog-wrapper">
                    <div class="dog-tail"></div>
                    <div class="dog-leg leg-fl"></div>
                    <div class="dog-leg leg-fr"></div>
                    <div class="dog-leg leg-bl"></div>
                    <div class="dog-leg leg-br"></div>
                    <div class="dog-body"></div>
                    <div class="dog-head">
                        <div class="dog-ear left"></div>
                        <div class="dog-ear right"></div>
                        <div class="dog-eye-group">
                            <div class="dog-eye"></div>
                            <div class="dog-eye"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container = document.getElementById('robo-dog-container');
        this.tooltip = document.getElementById('dog-tooltip');
        this.setupEventListeners();
        this.startAnimation();
        
        // Initial tooltip hint
        setTimeout(() => {
            if (this.state === DOG_CONFIG.STATES.IDLE) this.tooltip.style.opacity = '1';
        }, 2000);
    }

    setupEventListeners() {
        window.addEventListener('mousemove', (e) => this.handleMove(e.clientX, e.clientY));
        window.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.handleMove(touch.clientX, touch.clientY);
        });

        this.container.addEventListener('click', () => this.handleInteraction());
        document.getElementById('skip-intro-btn').addEventListener('click', () => this.revealDashboard(true));

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) cancelAnimationFrame(this.animationId);
            else this.startAnimation();
        });
    }

    handleMove(x, y) {
        this.target.x = x;
        this.target.y = y;
        this.lastMoveTime = Date.now();
        if (this.state === DOG_CONFIG.STATES.SLEEPY) this.setState(DOG_CONFIG.STATES.FOLLOW);
        
        // Show tooltip on proximity during intro
        if (!this.isAssistantMode) {
            const dist = Math.hypot(x - this.pos.x, y - this.pos.y);
            this.tooltip.style.opacity = dist < DOG_CONFIG.PROXIMITY_THRESHOLD ? '1' : '0';
        }
    }

    handleInteraction() {
        const now = Date.now();
        if (now - this.lastClickTime < DOG_CONFIG.CLICK_COOLDOWN) return;
        this.lastClickTime = now;

        this.bark();
        if (!this.isAssistantMode) {
            setTimeout(() => this.revealDashboard(), 400);
        }
    }

    bark() {
        this.setState(DOG_CONFIG.STATES.BARKING);

        this.container.style.transform += ' scale(1.2) translateY(-20px)';
        setTimeout(() => {
            this.container.style.transform = this.container.style.transform.replace(' scale(1.2) translateY(-20px)', '');
            this.setState(DOG_CONFIG.STATES.FOLLOW);
        }, 500);
    }

    setState(newState) {
        if (this.state === newState) return;
        this.state = newState;
        
        const tail = this.container.querySelector('.dog-tail');
        const eyes = this.container.querySelectorAll('.dog-eye');

        if (newState === DOG_CONFIG.STATES.EXCITED || newState === DOG_CONFIG.STATES.BARKING) {
            tail.style.animation = 'wag-excited 0.2s infinite';
            eyes.forEach(e => e.style.transform = 'scale(1.3)');
        } else {
            tail.style.animation = 'wag-idle 2s infinite';
            eyes.forEach(e => e.style.transform = 'scale(1)');
        }
    }

    revealDashboard(immediate = false) {
        const portal = document.getElementById('robo-dog-portal');
        const dashboard = document.getElementById('final-app-ui');
        
        if (immediate) {
            portal.style.display = 'none';
        } else {
            portal.style.opacity = '0';
            setTimeout(() => portal.style.display = 'none', 800);
        }

        dashboard.style.opacity = '1';
        dashboard.style.pointerEvents = 'auto';
        this.enterAssistantMode();
    }

    enterAssistantMode() {
        this.isAssistantMode = true;
        this.container.classList.add('mini');
        this.tooltip.style.display = 'none';
        
        // Anchor to bottom right initially
        this.target.x = window.innerWidth - 60;
        this.target.y = window.innerHeight - 60;
    }

    startAnimation() {
        const loop = (time) => {
            if (time - this.lastFrameTime > 1000 / DOG_CONFIG.FPS) {
                this.lastFrameTime = time;
                this.update();
            }
            this.animationId = requestAnimationFrame(loop);
        };
        this.animationId = requestAnimationFrame(loop);
    }

    update() {
        const lerp = this.isAssistantMode ? DOG_CONFIG.MINI_LERP_SPEED : DOG_CONFIG.LERP_SPEED;
        
        // Smooth following
        this.pos.x += (this.target.x - this.pos.x) * lerp;
        this.pos.y += (this.target.y - this.pos.y) * lerp;

        // Boundary clamping
        const margin = 50;
        this.pos.x = Math.max(margin, Math.min(window.innerWidth - margin, this.pos.x));
        this.pos.y = Math.max(margin, Math.min(window.innerHeight - margin, this.pos.y));

        // Apply movement
        this.container.style.left = `${this.pos.x - 30}px`;
        this.container.style.top = `${this.pos.y - 30}px`;

        // Head tracking
        const head = this.container.querySelector('.dog-head');
        const dx = this.target.x - this.pos.x;
        const dy = this.target.y - this.pos.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        head.style.transform = `rotate(${angle * 0.1}deg)`;

        // Idle check
        if (Date.now() - this.lastMoveTime > DOG_CONFIG.IDLE_TIMEOUT) {
            if (!this.isAssistantMode) this.setState(DOG_CONFIG.STATES.SLEEPY);
            else {
                // Return to anchor position in assistant mode if idle
                this.target.x = window.innerWidth - 60;
                this.target.y = window.innerHeight - 60;
            }
        }
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.roboDog = new RoboDog();
});
