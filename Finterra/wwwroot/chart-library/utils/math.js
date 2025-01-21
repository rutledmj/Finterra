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
    return x;
}
