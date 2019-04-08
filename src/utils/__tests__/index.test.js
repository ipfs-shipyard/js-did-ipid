import { pemToBuffer, generateIpnsName, generateDid, parseDid, generateRandomString } from '../index';

const mockKeyPEM = `
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

const mockKeyBuffer = new Uint8Array([8, 0, 18, 225, 4, 48, 130, 2, 93, 2, 1, 0, 2, 129, 129, 0, 194, 65, 156, 145, 8, 243, 28, 4, 242, 246, 39, 100, 174, 35, 100, 221, 185, 30, 236, 203, 111, 48, 153, 196, 115, 126, 63, 31, 93, 4, 219, 143, 92, 201, 81, 25, 46, 203, 221, 194, 34, 222, 12, 233, 198, 151, 47, 111, 108, 128, 221, 162, 0, 10, 203, 175, 189, 235, 217, 236, 236, 249, 81, 162, 10, 128, 45, 34, 231, 101, 234, 163, 48, 80, 109, 142, 210, 24, 221, 202, 33, 195, 180, 39, 35, 195, 162, 28, 232, 181, 66, 90, 190, 135, 115, 36, 161, 78, 107, 209, 24, 208, 186, 101, 211, 141, 130, 51, 135, 86, 230, 243, 161, 235, 245, 150, 172, 72, 17, 83, 23, 204, 35, 38, 237, 25, 16, 59, 2, 3, 1, 0, 1, 2, 129, 129, 0, 163, 34, 242, 215, 162, 138, 120, 23, 119, 235, 93, 61, 226, 56, 123, 54, 241, 134, 149, 26, 107, 176, 135, 18, 66, 99, 221, 162, 251, 61, 95, 30, 80, 176, 8, 217, 123, 65, 94, 100, 241, 95, 69, 188, 246, 56, 117, 111, 191, 209, 161, 79, 177, 117, 95, 133, 161, 155, 246, 146, 80, 153, 57, 1, 194, 106, 250, 171, 200, 101, 123, 125, 246, 101, 17, 59, 93, 199, 61, 175, 152, 17, 196, 135, 78, 35, 221, 224, 92, 88, 42, 29, 166, 145, 97, 199, 120, 241, 216, 72, 88, 192, 136, 117, 146, 81, 227, 213, 134, 229, 254, 189, 204, 9, 30, 154, 70, 17, 17, 231, 48, 140, 8, 45, 87, 74, 5, 113, 2, 65, 0, 244, 94, 180, 110, 158, 162, 153, 52, 155, 248, 46, 2, 106, 7, 12, 136, 61, 250, 123, 238, 138, 212, 38, 118, 173, 231, 201, 225, 61, 221, 143, 207, 33, 171, 24, 202, 245, 34, 165, 142, 45, 26, 98, 162, 10, 214, 195, 13, 112, 74, 30, 54, 60, 250, 110, 127, 238, 213, 60, 158, 10, 215, 150, 167, 2, 65, 0, 203, 128, 88, 36, 48, 184, 15, 248, 192, 161, 65, 220, 225, 17, 7, 120, 44, 6, 47, 189, 202, 50, 106, 100, 79, 91, 235, 143, 8, 250, 228, 221, 108, 253, 68, 28, 101, 85, 136, 116, 149, 31, 16, 80, 140, 226, 127, 188, 110, 60, 26, 187, 22, 12, 25, 82, 42, 204, 250, 183, 16, 145, 64, 77, 2, 65, 0, 185, 223, 163, 76, 148, 219, 70, 191, 78, 119, 122, 191, 153, 88, 93, 62, 240, 45, 171, 192, 168, 214, 111, 159, 75, 238, 7, 143, 141, 24, 14, 255, 213, 51, 40, 59, 144, 51, 215, 75, 138, 161, 12, 47, 7, 33, 141, 225, 149, 236, 186, 136, 52, 223, 163, 215, 41, 154, 6, 110, 139, 254, 169, 247, 2, 64, 8, 246, 31, 235, 136, 17, 178, 242, 91, 89, 62, 147, 65, 126, 4, 124, 48, 68, 29, 122, 24, 27, 92, 64, 10, 150, 155, 170, 242, 212, 73, 155, 206, 158, 224, 142, 247, 143, 106, 176, 231, 152, 52, 153, 183, 122, 137, 241, 124, 81, 61, 68, 27, 214, 112, 143, 3, 191, 127, 18, 236, 177, 216, 201, 2, 64, 69, 76, 214, 200, 168, 89, 210, 145, 165, 87, 34, 46, 117, 161, 124, 42, 98, 93, 127, 214, 31, 204, 170, 129, 232, 89, 214, 52, 101, 80, 156, 182, 218, 200, 214, 182, 82, 152, 32, 91, 42, 72, 156, 118, 240, 108, 38, 141, 156, 247, 94, 160, 136, 252, 6, 165, 193, 136, 206, 90, 237, 243, 123, 22]);

const mockIdentifier = 'QmUTE4cxTxihntPEFqTprgbqyyS9YRaRcC8FXp6PACEjFG';
const mockDID = `did:ipid:${mockIdentifier}`;

describe('pemToBuffer', () => {
    it('should convert PEM to Buffer correctly', async () => {
        const buffer = await pemToBuffer(mockKeyPEM);

        expect(new Uint8Array(buffer)).toEqual(mockKeyBuffer);
    });

    it('should fail if invalid PEM provided', async () => {
        expect(pemToBuffer('foo')).rejects.toThrow('Invalid PEM formatted message');
    });
});

describe('generateIpnsName', () => {
    it('should generate IPNS name correctly', async () => {
        const name = await generateIpnsName(mockKeyBuffer);

        expect(name).toEqual(mockIdentifier);
    });

    it('should fail to generate IPNS name with invalid key buffer', async () => {
        expect(generateIpnsName(new Uint8Array([1, 2, 3]))).rejects.toThrow('Decoded message is not valid, missing required field: Type');
    });
});

describe('generateDid', () => {
    it('should generate DID correctly', async () => {
        const name = await generateDid(mockKeyBuffer);

        expect(name).toEqual(mockDID);
    });
});

describe('parseDid', () => {
    it('should parse DID correctly', async () => {
        const result = await parseDid(mockDID);

        expect(result).toEqual({ method: 'ipid', identifier: mockIdentifier });
    });

    it('should fail if invalid DID', async () => {
        expect(() => parseDid('foo:bar:a1b2c3')).toThrow('Invalid DID: foo:bar:a1b2c3');
    });
});

describe('generateRandomString', () => {
    it('should generate random string correctly', async () => {
        global.Math.random = jest.fn(() => 0.640819155330087);

        expect(generateRandomString()).toEqual('n2i23tw5al');
        expect(global.Math.random).toHaveBeenCalledTimes(1);
    });
});
