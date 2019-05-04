import { isString, isPlainObject } from 'lodash';
import { generateRandomString, isDidValid } from '../../utils';
import { InvalidDocument } from '../../utils/errors';

const DEFAULT_CONTEXT = 'https://w3id.org/did/v1';

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

export const generateDocument = (did) => ({
    '@context': DEFAULT_CONTEXT,
    id: did,
    created: new Date().toISOString(),
});

export const assertDocument = (content) => {
    if (!isPlainObject(content)) {
        throw new InvalidDocument('Document content must be a plain object.');
    }

    const { '@context': context, id } = content;

    if (!context) {
        throw new InvalidDocument('Document content must contain "@context" property.');
    } else if (Array.isArray(context)) {
        if (context[0] !== DEFAULT_CONTEXT) {
            throw new InvalidDocument(`First "@context" value must be: "${DEFAULT_CONTEXT}". Found: "${context[0]}"`);
        }
    } else if (isString(context)) {
        if (context !== DEFAULT_CONTEXT) {
            throw new InvalidDocument(`Document with only one "@context" value must be none other than: "${DEFAULT_CONTEXT}". Found: "${context}"`);
        }
    } else {
        throw new InvalidDocument('Document "@context" value must be a string or an ordered set.');
    }

    if (!id) {
        throw new InvalidDocument('Document content must contain "id" property.');
    } else if (!isDidValid(id)) {
        throw new InvalidDocument(`Document "id" must be a valid DID. Found: "${id}"`);
    }
};
