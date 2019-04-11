import { omitBy, isArray, isUndefined } from 'lodash';

import service from './service';
import publicKey from './publicKey';
import authentication from './authentication';
import { generateDocument, isEquivalentId } from './utils';

class Document {
    #content;

    constructor({ content }) {
        this.#content = {
            publicKey: [],
            authentication: [],
            service: [],
            ...content,
        };
    }

    getContent() {
        return omitBy(this.#content, (prop) => isUndefined(prop) || (isArray(prop) && prop.length === 0));
    }

    addPublicKey(props) {
        props.id = publicKey.createId(this.#content.id, props.id);
        props.controller = props.controller || this.#content.id;

        publicKey.assert(props, this.#content.publicKey);

        this.#content.publicKey.push(props);
        this.#refreshUpdated();

        return props;
    }

    revokePublicKey(id) {
        const filter = this.#content.publicKey.filter((key) => !isEquivalentId(key.id, id, publicKey.separator));

        if (this.#content.publicKey.length === filter.length) {
            return;
        }

        this.removeAuthentication(id);

        this.#content.publicKey = filter;
        this.#refreshUpdated();
    }

    addAuthentication(auth) {
        const key = this.#content.publicKey.find((pk) => isEquivalentId(pk.id, auth, publicKey.separator)) || {};

        authentication.assert(key.id, this.#content.authentication);

        this.#content.authentication.push(key.id);
        this.#refreshUpdated();

        return key.id;
    }

    removeAuthentication(id) {
        const filter = this.#content.authentication.filter((auth) => !isEquivalentId(id, authentication.parseId(auth), publicKey.separator));

        if (this.#content.authentication.length === filter.length) {
            return;
        }

        this.#content.authentication = filter;
        this.#refreshUpdated();
    }

    addService(props) {
        props.id = service.createId(this.#content.id, props.id);

        service.assert(props, this.#content.service);

        this.#content.service.push(props);
        this.#refreshUpdated();

        return props;
    }

    removeService(id) {
        const filter = this.#content.service.filter((srvc) => !isEquivalentId(srvc.id, id, service.separator));

        if (this.#content.service.length === filter.length) {
            return;
        }

        this.#content.service = filter;
        this.#refreshUpdated();
    }

    #refreshUpdated = () => {
        this.#content.updated = new Date().toISOString();
    }
}

const createDocument = async (key, content) => {
    if (!content) {
        content = await generateDocument(key);
    }

    return new Document({ content });
};

export default createDocument;
