import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

@Injectable()
export class CardCryptoService {
    private readonly key: Buffer;

    constructor() {
        const rawKey = process.env.CARD_ENCRYPTION_KEY!;
        this.key = Buffer.from(rawKey, 'hex');
        if (this.key.length !== 32) {
            throw new Error('CARD_ENCRYPTION_KEY must be a 32-byte (64 hex char) key');
        }
    }

    encrypt(plainText: string): { encrypted: string; iv: string; authTag: string } {
        const iv = randomBytes(12);
        const cipher = createCipheriv(ALGORITHM, this.key, iv);

        const encrypted = Buffer.concat([
            cipher.update(plainText, 'utf8'),
            cipher.final(),
        ]);

        return {
            encrypted: encrypted.toString('hex'),
            iv: iv.toString('hex'),
            authTag: cipher.getAuthTag().toString('hex'),
        };
    }

    decrypt(encrypted: string, iv: string, authTag: string): string {
        const decipher = createDecipheriv(ALGORITHM, this.key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encrypted, 'hex')),
            decipher.final(),
        ]);

        return decrypted.toString('utf8');
    }
}