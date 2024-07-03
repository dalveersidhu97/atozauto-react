
export function extractDateFromVetHeader(inputString: string) {
    const regex = /\b\w{3}, (\w{3} \d{1,2})\b/;
    const match = inputString.match(regex);

    if (match) {
        return match[1];
    } else {
        return undefined;
    }
}
