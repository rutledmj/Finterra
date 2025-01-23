// interval.js

export class Interval {
    /**
     * @param {number} value  - Numerical value (e.g., 1, 5, 233).
     * @param {string} unit   - Time unit (e.g., 'day', 'minute').
     * @param {string} label  - Human-readable label (e.g., '1 Day', '5 Minutes').
     */
    constructor(value, unit, label) {
        this.value = value;
        this.unit = unit;
        this.label = label;
    }

    /**
     * Returns a string representation of this interval.
     */
    toString() {
        return `${this.label} (${this.value} ${this.unit})`;
    }
}
