import { isString } from 'lodash';
import { generateDid, generateRandomString } from '../../utils';

export const createId = (did, fragment, separator) => {
    fragment = fragment || generateRandomString();

    return `${did}${separator}${fragment}`;
};

export const isEquivalentId = (id1, id2, separator) => {
    if (!isString(id1) || !isString(id2)) {
        return false;
    }

    id1 = id1.includes(separator) ? id1.split(separator)[1] : id1;
    id2 = id2.includes(separator) ? id2.split(separator)[1] : id2;

    return id1 === id2;
};

export const generateDocument = async (key) => {
    const did = await generateDid(key);

    return {
        '@context': 'https://w3id.org/did/v1',
        id: did,
        created: new Date().toISOString(),
    };
};
