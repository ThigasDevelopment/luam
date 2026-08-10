export interface TransportResult {
    ok: boolean;
    message: string;
}

export interface MtaTransport {
    readonly kind: string;
    refresh(): Promise<TransportResult>;
    restart(resource: string): Promise<TransportResult>;
}

export function transportSuccess(message: string): TransportResult {
    return { ok: true, message };
}

export function transportFailure(message: string): TransportResult {
    return { ok: false, message };
}
