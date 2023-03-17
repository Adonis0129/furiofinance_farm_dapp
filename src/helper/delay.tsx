export const delay = (seconds: number) => {
    return new Promise(resolve => setTimeout(() => resolve(null), seconds * 1000));
};