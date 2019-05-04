import { Buffer } from 'buffer';
import createDocument, { assertDocument } from './document';
import { generateRandomString, generateDid, parseDid, pemToBuffer } from './utils';
import { UnavailableIpfs, InvalidDid, IllegalCreate } from './utils/errors';

class Ipid {
    #ipfs;
    #lifetime;

    constructor(ipfs, lifetime) {
        this.#ipfs = ipfs;
        this.#lifetime = lifetime || '87600h';
    }

    async resolve(did) {
        const { identifier } = parseDid(did);

        try {
            const { path } = await this.#ipfs.name.resolve(identifier, {});
            const [{ content }] = await this.#ipfs.get(path, {});

            const parsedContent = JSON.parse(content.toString());

            assertDocument(parsedContent);

            return parsedContent;
        } catch (err) {
            if (err.code === 'INVALID_DOCUMENT') {
                throw err;
            }

            throw new InvalidDid(did, `Unable to resolve document with did: ${did}`);
        }
    }

    async create(pem, operations) {
        const did = await getDid(pem);

        try {
            await this.resolve(did);
        } catch (err) {
            const document = createDocument(did);

            operations(document);

            return this.#publish(pem, document.getContent());
        }

        throw new IllegalCreate();
    }

    async update(pem, operations) {
        const did = await getDid(pem);

        const content = await this.resolve(did);
        const document = createDocument(did, content);

        operations(document);

        return this.#publish(pem, document.getContent());
    }

    #publish = async (pem, content) => {
        const keyName = this.#generateKeyName();

        await this.#importKey(keyName, pem);

        try {
            const [{ path }] = await this.#ipfs.add(Buffer.from(JSON.stringify(content)));

            await this.#ipfs.name.publish(path, {
                lifetime: this.#lifetime,
                ttl: this.#lifetime,
                key: keyName,
            });

            return content;
        } finally {
            await this.#removeKey(keyName);
        }
    }

    #removeKey = async (keyName) => {
        const keysList = await this.#ipfs.key.list();
        const hasKey = keysList.some(({ name }) => name === keyName);

        if (!hasKey) {
            return;
        }

        await this.#ipfs.key.rm(keyName);
    }

    #importKey = async (keyName, pem) => {
        await this.#removeKey(keyName);

        await this.#ipfs.key.import(keyName, pem, undefined);
    }

    #generateKeyName = () =>
        `js-ipid-${generateRandomString()}`;
}

export const getDid = async (pem) => {
    const key = await pemToBuffer(pem);

    return generateDid(key);
};

const createIpid = async (ipfs, { lifetime } = {}) => {
    if (!ipfs || !ipfs.isOnline()) {
        throw new UnavailableIpfs();
    }

    return new Ipid(ipfs, lifetime);
};

export default createIpid;
