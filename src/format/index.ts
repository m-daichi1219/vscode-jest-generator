
export const testFormat = `
describe('describe', () => {
    test('test', async () => {
        // do something
    });
});
`;

export const testEachFormat = `describe('describe', () => {
    test.each([])('test', async () => {
        // do something
    });
});
`;