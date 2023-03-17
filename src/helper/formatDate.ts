export function formatDateFromSeconds(timestamp: number) {

    const months = Math.floor(timestamp / (86400 * 30))
    const days = Math.floor(timestamp / 86400 - months * 30)
    const hours = Math.floor(timestamp % 86400 / 3600)

    return `${months !== 0 ? months + ' Month ' : ''}` + `${days !== 0 ? days + ' Days ' : ''}` + `${hours + ' Hours '}`
}