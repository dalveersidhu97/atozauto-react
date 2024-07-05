import { equalDateStrings } from "../content.utils"

const comparableDates = [
    { dateStr1: 'Jul 05', dateStr2: 'Jul 5', expectedOutput: true },
    { dateStr1: 'Jul 05, Fri', dateStr2: 'Jul 5, Fri', expectedOutput: true },
    { dateStr1: 'Fri, Jan 05', dateStr2: 'jan 5th, Fri', expectedOutput: true },
    { dateStr1: 'Fri, July 05', dateStr2: 'Jul 5, Fri', expectedOutput: true },
    { dateStr1: 'Fri, feb 20, 2024', dateStr2: 'Feb 20, Fri, 2024', expectedOutput: true },
    { dateStr1: 'July 1st, 2024', dateStr2: 'Jul 1, Fri, 2024', expectedOutput: true },
    { dateStr1: 'July 5, 2024', dateStr2: 'Fri, Jul 05, 2024', expectedOutput: true },
    { dateStr1: 'july 3rd, 2024', dateStr2: 'Friday, JUL 3, 2024', expectedOutput: true },
    { dateStr1: 'Dec 20th, 2024', dateStr2: 'Friday, dec 20, 2024', expectedOutput: true },
    { dateStr1: 'March 21st, 2024', dateStr2: 'Friday, Mar 21, 2024', expectedOutput: true },
    { dateStr1: '', dateStr2: '', expectedOutput: false },
    { dateStr1: undefined, dateStr2: null, expectedOutput: false },
    { dateStr1: undefined, dateStr2: 'Jul 5', expectedOutput: false },
    { dateStr1: 'july 5, 2024', dateStr2: 'Friday, JUL 15, 2024', expectedOutput: false },
    { dateStr1: 'Jun 5, 2024', dateStr2: 'Friday, JUL 5, 2024', expectedOutput: false },
    { dateStr1: "Fri, Jul 5", dateStr2: "Jul 05, Fri", expectedOutput: true }
];

const runTestsForFn = (equalDatesFn: typeof equalDateStrings) => {
    comparableDates.forEach(({ dateStr1, dateStr2, expectedOutput }) => {
        test(`${dateStr1} === ${dateStr2} should be ${expectedOutput}`, () => {
            const functionOutput = equalDatesFn(dateStr1 as string, dateStr2 as string)
            expect(functionOutput).toBe(expectedOutput);
        })
    })
}

// describe('equalDateStringsDepricated', () => {
//     runTestsForFn(equalDateStringsDepricated);
// })

describe('equalDateStrings', () => {
    runTestsForFn(equalDateStrings);
})