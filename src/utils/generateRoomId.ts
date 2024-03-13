export const generateId = (idLenght: number = 10): string => {
    return crypto.randomUUID().replace(/-/g, '').slice(0, idLenght);
};
