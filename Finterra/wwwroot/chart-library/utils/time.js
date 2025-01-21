export function formatDate(date, format) {
    switch (format) {
        case 'Year':
            return date.getFullYear().toString();
        case 'Month':
            return (date.getMonth() + 1).toString().padStart(2, '0');
        case 'Week':
            return getIso8601WeekOfYear(date).toString();
        case 'Day':
            return date.getDate().toString().padStart(2, '0');
        case 'Hour':
            return date.getHours().toString().padStart(2, '0');
        default:
            return date.toISOString();
    }
}

export function getIso8601WeekOfYear(date) {
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const jan4 = new Date(target.getFullYear(), 0, 4);
    const dayDiff = (target - jan4) / 86400000;
    return 1 + Math.ceil(dayDiff / 7);
}