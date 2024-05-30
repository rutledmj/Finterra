import { createSpan, createElement, buttonHover } from '../Utils.js'

export class Clock {
    constructor(options) {
        this.toolbar = options.toolbar;
        this.initialize();
    }

    initialize() {
        this.clockButton = this.createButton();
        this.createClock();
        this.toolbar.container.appendChild(this.clockButton);
    }

    createButton() {
        const button = createElement('button', 'toolbar-button');
        button.style.float = "right";

        // Add hover effects
        buttonHover(button);

        this.clockSpan = createSpan('');
        button.appendChild(this.clockSpan);

        return button;
    }

    createClock() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000); // Update the time every second
    }

    updateTime() {
        const now = new Date();
        let timeZoneOffset = -now.getTimezoneOffset() / 60; // Get the offset in hours
        let offsetSign = timeZoneOffset >= 0 ? '+' : ''; // Determine the sign
        let formattedTimeZone = `UTC${offsetSign}${timeZoneOffset}`;

        const timeString = now.toLocaleTimeString('en-US');
        this.clockSpan.textContent = `${timeString} (${formattedTimeZone})`;
    }

    onClickEvent() {
        // Your onClick event logic here
    }
}