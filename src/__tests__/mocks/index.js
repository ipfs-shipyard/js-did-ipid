export const mockHash = 'zdpuApA2CCoPHQEoP4nResbK2dq2zawFX3verNkMFmNbpDnXZ';

export const mockPath = `/ipfs/${mockHash}`;

export const mockIpnsHash = 'QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG';

export const mockDid = `did:ipid:${mockIpnsHash}`;

export const mockDocument = {
    '@context': 'https://w3id.org/did/v1',
    id: mockDid,
    created: '2019-03-19T16:52:44.948Z',
    updated: '2019-03-19T16:53:56.463Z',
    publicKey: [
        {
            id: `${mockDid}#bqvnazrkarh`,
            type: 'myType',
            controller: 'myController',
            publicKeyHex: '1A2B3C',
        },
    ],
    authentication: [
        `${mockDid}#bqvnazrkarh`,
    ],
    service: [
        {
            id: `${mockDid};myServiceId`,
            type: 'myServiceType',
            serviceEndpoint: 'http://myserviceendpoint.com',
        },
    ],
};

export const createMockIpfs = () => {
    let keychainKeys = [{ name: 'key1' }, { name: 'key2' }];

    const rmKey = (keyName) => {
        keychainKeys = keychainKeys.filter(({ name }) => name === keyName);
    };

    const addKey = (keyName) => {
        rmKey(keyName);

        keychainKeys.push({ name: keyName });
    };

    return {
        isOnline: jest.fn(() => true),
        name: {
            resolve: jest.fn(async () => ({ path: mockPath })),
            publish: jest.fn(async () => {}),
        },
        dag: {
            put: jest.fn(async () => ({
                toBaseEncodedString: () => mockHash,
            })),
            get: jest.fn(async () => ({
                value: mockDocument,
            })),
        },
        key: {
            list: jest.fn(async () => keychainKeys),
            rm: jest.fn(async (keyName) => rmKey(keyName)),
            import: jest.fn(async (keyName) => addKey(keyName)),
        },
    };
};

export const mockPem = `
-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDCQZyRCPMcBPL2J2SuI2TduR7sy28wmcRzfj8fXQTbj1zJURku
y93CIt4M6caXL29sgN2iAArLr73r2ezs+VGiCoAtIudl6qMwUG2O0hjdyiHDtCcj
w6Ic6LVCWr6HcyShTmvRGNC6ZdONgjOHVubzoev1lqxIEVMXzCMm7RkQOwIDAQAB
AoGBAKMi8teiingXd+tdPeI4ezbxhpUaa7CHEkJj3aL7PV8eULAI2XtBXmTxX0W8
9jh1b7/RoU+xdV+FoZv2klCZOQHCavqryGV7ffZlETtdxz2vmBHEh04j3eBcWCod
ppFhx3jx2EhYwIh1klHj1Ybl/r3MCR6aRhER5zCMCC1XSgVxAkEA9F60bp6imTSb
+C4CagcMiD36e+6K1CZ2refJ4T3dj88hqxjK9SKlji0aYqIK1sMNcEoeNjz6bn/u
1TyeCteWpwJBAMuAWCQwuA/4wKFB3OERB3gsBi+9yjJqZE9b648I+uTdbP1EHGVV
iHSVHxBQjOJ/vG48GrsWDBlSKsz6txCRQE0CQQC536NMlNtGv053er+ZWF0+8C2r
wKjWb59L7gePjRgO/9UzKDuQM9dLiqEMLwchjeGV7LqINN+j1ymaBm6L/qn3AkAI
9h/riBGy8ltZPpNBfgR8MEQdehgbXEAKlpuq8tRJm86e4I73j2qw55g0mbd6ifF8
UT1EG9ZwjwO/fxLssdjJAkBFTNbIqFnSkaVXIi51oXwqYl1/1h/MqoHoWdY0ZVCc
ttrI1rZSmCBbKkicdvBsJo2c916giPwGpcGIzlrt83sW
-----END RSA PRIVATE KEY-----`;
