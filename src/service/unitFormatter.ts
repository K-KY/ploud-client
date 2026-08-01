const FILE_SIZE_UNITS = ["B", "KB", "MB", "GB", "TB"];

export const formatFileSize = (size:number) => {
    if (!Number.isFinite(size) || size < 0) {
        return "0 B";
    }

    let value = size;
    let unitIndex = 0;

    while (value >= 1000 && unitIndex < FILE_SIZE_UNITS.length - 1) {
        value /= 1000;
        unitIndex += 1;
    }

    const formattedValue = value >= 10 || unitIndex === 0
        ? Math.round(value).toString()
        : value.toFixed(1);

    return `${formattedValue} ${FILE_SIZE_UNITS[unitIndex]}`;
}