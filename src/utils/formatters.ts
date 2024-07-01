
export function padWithZero(num: number) {
    let str = String(num);
    if (str.length < 2)
        str = '0' + str;
    return str;
}

export function getCurrentTime() {
    const now = new Date();

    // Use built-in functions to get hours and minutes
    const hours = now.getHours().toString().padStart(2, '0'); // Ensure two digits
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure two digits

    // Concatenate hours and minutes with a colon
    const currentTime = `${hours}:${minutes}`;

    return currentTime;
}

export const adjustIntMinsForMinimumValue = (intMins: number, minimumIntMins?: number) => {
    if (minimumIntMins !== undefined && intMins < minimumIntMins)
        intMins = 24 * 60 + intMins;
    return intMins;
}

export const timeStringToIntMins = (timeStr: string, minimumIntMins?: number) => { // 24:01 => 24*60+1
    const parts = timeStr.split(':');
    if (parts.length < 2) return NaN;
    const hours = +parts[0];
    const mins = +parts[1];
    if (isNaN(hours) || isNaN(mins)) return NaN;
    let intMins = hours * 60 + mins;
    return adjustIntMinsForMinimumValue(intMins, minimumIntMins);
}
export const intMinsToTimeStr = (intMins: number) => { // 24*60+1 => 24:01
    const mins = intMins % 60;
    let hours = (intMins - mins) / 60;
    if (hours > 23) {
        hours = hours - 24;
    }
    const timeStr = padWithZero(hours) + ':' + padWithZero(mins);
    return timeStr;
}

export function formatDate(date: Date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate();
    const dayOfWeek = days[date.getDay()];

    return `${month} ${dayOfMonth.toString().padStart(2, '0')}, ${dayOfWeek}`;
}

export function intMinsToString(timeMins: number) {
    let intTime = timeMins;
    if (intTime < 0) intTime = 24 * 60 + intTime;
    let minutes = intTime % 60;
    let hours = (intTime - minutes) / 60;
    return `${hours} hours ${minutes} minutes`
}

export function intMinsToTime12(intTime: number) {
    let minutes: number|string = intTime % 60;
    let hours = (intTime - minutes) / 60;
    if (hours > 24) hours = hours - 24;
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours)
    minutes = minutes < 10 ? '0' + minutes : minutes; // Add leading zero if minutes < 10
    return hours + ':' + minutes + ampm;
}

export function getYesterdayDate() {
    const now = new Date();
    now.setDate(now.getDate() - 1); // Subtract 1 day
    return now;
}

export function moveElementToFront(array: string[], element: string) {
    const newArray = [...array];
    const index = newArray.indexOf(element);
    if (index > -1) {
        newArray.splice(index, 1);
        newArray.unshift(element);
    }
    return newArray;
}
export function moveObjectWithKeyToFront(array: { key: string, label: string }[], keyToMove: string) {
    const newArray = array.slice();
    const index = newArray.findIndex(obj => obj.key === keyToMove);
    if (index > -1) {
        const objectToMove = newArray.splice(index, 1)[0];
        newArray.unshift(objectToMove);
    }
    return newArray;
}