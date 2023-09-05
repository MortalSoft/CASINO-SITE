import notp from "notp";
import { Options } from "./interfaces";
export declare function generateSecret(options?: Options): {
    secret: string;
    uri: string;
    qr: string;
};
export declare function generateToken(secret: string): {
    token: string;
} | null;
export declare function verifyToken(secret: string, token?: string, window?: number): notp.VerifyResult | null;
