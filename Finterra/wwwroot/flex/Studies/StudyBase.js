
export function getContrastingColor(color) {
    // Remove the '#' character if present
    color = color.replace('#', '');

    // Convert the color to RGB values
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Calculate the brightness of the color
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return white or black based on the brightness threshold
    return brightness > 128 ? 'black' : 'white';
}

export function getDataRange(pane, dataArrays) {
    const { barSpacing, barWidth } = pane.chart;
    const paneWidth = pane.width;
    const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));

    let globalMin = Infinity;
    let globalMax = -Infinity;

    // Loop through each data array to find the visible range and min/max
    dataArrays.forEach(arr => {
        const startIndex = Math.max(0, arr.length - barsCount + pane.chart.offset);
        const endIndex = arr.length - 1 + pane.chart.offset;
        const visibleData = arr.slice(startIndex, endIndex + 1);

        const min = Math.min(...visibleData);
        const max = Math.max(...visibleData);

        // Update the global min and max across all arrays
        if (min < globalMin) globalMin = min;
        if (max > globalMax) globalMax = max;
    });

    return { min: globalMin, max: globalMax };
}


export function paintAxisLabel(value, color, pane) {
    const ctx = pane.axis.getContext('2d');
    const width = pane.axis.width;
    const height = 18;
    const padding = 4;
    const x = 0;
    const y = scaleY(value, pane) - Math.ceil(height / 2);

    // Draw the background rectangle
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    // Draw the value text
    ctx.font = "12px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = getContrastingColor(color);
    ctx.fillText(value.toFixed(2), width / 2, y + height / 2);

    // Draw the horizontal line
    ctx.strokeStyle = getContrastingColor(color);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + height / 2);
    ctx.lineTo(padding, y + height / 2);
    ctx.stroke();
}

export function scaleY(value, pane) {
    const range = pane.max - pane.min;
    const scale = (value - pane.min) / range;
    return Math.ceil(pane.height - scale * pane.height) - .5;
}

export function scaleX(value, startIndex, pane) {

    const barSpacing = pane.chart.barSpacing;
    const barWidth = pane.chart.barWidth;
    const paneWidth = pane.width;
    const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));
    const x = Math.ceil((value - startIndex) * (pane.chart.barSpacing + pane.chart.barWidth)) - .5;
    return x
}

export function drawLine(pane, values, color) {
    
    const barSpacing = pane.chart.barSpacing;
    const barWidth = pane.chart.barWidth;
    const paneWidth = pane.width;
    const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));
    const startIndex = Math.max(0, values.length - barsCount + pane.chart.offset);
    const endIndex = values.length - 1 + pane.chart.offset;

    const ctx = pane.canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    let prevX = null, prevY = null;

    for (let i = startIndex; i <= endIndex; i++) {
        const x = scaleX(i, startIndex, pane);
        const y = scaleY(values[i], pane);

        if (prevX !== null && prevY !== null) {
            ctx.lineTo(x, y);
        } else {
            ctx.moveTo(x, y);
        }

        prevX = x;
        prevY = y;
    }
    ctx.stroke();
}

export function drawHistogram(pane, values, color) {
    const barSpacing = pane.chart.barSpacing;
    const barWidth = pane.chart.barWidth;
    const paneWidth = pane.width;
    const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));
    const startIndex = Math.max(0, values.length - barsCount + pane.chart.offset);
    const endIndex = values.length - 1 + pane.chart.offset;

    const ctx = pane.canvas.getContext('2d');
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    for (let i = startIndex; i <= endIndex; i++) {

        const x = scaleX(i, startIndex, pane);
        const y = scaleY(values[i], pane);

        const height = scaleY(0, pane) - y;

        ctx.moveTo(x, scaleY(0, pane));
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}

export function paintCandles(pane, data, style) {
    const { bodyup, bodydown, borderup, borderdown, wickup, wickdown } = style;
    const ctx = pane.canvas.getContext('2d');
    ctx.lineWidth = 1;

    const barSpacing = pane.chart.barSpacing;
    const barWidth = pane.chart.barWidth;
    const paneWidth = pane.width;
    const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));
    const startIndex = Math.max(0, data.length - barsCount + pane.chart.offset);
    const endIndex = data.length - 1 + Math.min(pane.chart.offset, 0);

    for (let i = startIndex; i <= endIndex; i++) {
        if (data[i] !== null) {
            const x = scaleX(i, startIndex, pane);

            const open = data[i]["open"];
            const close = data[i]["close"];
            const high = data[i]["high"];
            const low = data[i]["low"];
            const isGreenCandle = open <= close;

            // Draw wick
            const topWick = scaleY(high, pane);
            const bottomWick = scaleY(low, pane);
            ctx.beginPath();
            ctx.strokeStyle = isGreenCandle ? wickup : wickdown;
            ctx.moveTo(x, topWick);
            ctx.lineTo(x, bottomWick);
            ctx.stroke();

            // Draw body
            const topBody = scaleY(Math.max(open, close), pane);
            const bottomBody = scaleY(Math.min(open, close), pane);
            ctx.fillStyle = isGreenCandle ? bodyup : bodydown;
            ctx.fillRect(x - barWidth / 2, topBody, barWidth, bottomBody - topBody);
            ctx.strokeStyle = isGreenCandle ? borderup : borderdown;
            ctx.strokeRect(x - barWidth / 2, topBody, barWidth, bottomBody - topBody);
        }
    }
}

export function drawHorizontalLine(pane, values, color) {

    const paneWidth = pane.width;

    const ctx = pane.canvas.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = color;

    const y = scaleY(values, pane);
    ctx.moveTo(0, y);
    ctx.lineTo(paneWidth, y);

    ctx.stroke();
}

export function drawVerticalLine(pane, value, data, color) {

    const { barSpacing, barWidth } = pane.chart;
    const paneWidth = pane.width;
    const paneHeight = pane.height;
    const barsCount = Math.floor(paneWidth / (barSpacing + barWidth));
    const startIndex = Math.max(0, data.length - barsCount + pane.chart.offset);

    const ctx = pane.canvas.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    const x = scaleX(value, startIndex, pane);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, paneHeight);
    ctx.stroke();
}