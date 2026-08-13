import type { ManifestObject } from '@compiler/manifest/manifest-value';

import { NONE_TRANSPORT, type TransportConfig } from '@cli/config/config-schema';
import { readNumber, readString } from '@cli/config/value-readers';
import type { ValidationContext } from '@cli/config/validation-context';

const MISSING_FIELD = 'config-missing-field';

const PLAINTEXT_PASSWORD = 'config-plaintext-password';

const MISSING_SECRET = 'config-missing-secret';

const INVALID_SEGMENT = 'config-invalid-url-segment';

const REMOTE_PLAINTEXT = 'config-remote-plaintext-transport';

const SCOPE = 'transport';

const URL_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const URL_HOST = /^[A-Za-z0-9._[\]:-]+$/;

const LOOPBACK_HOSTS: readonly string[] = ['localhost', '127.0.0.1', '::1', '[::1]'];

function validateSegment(value: string | null, field: string, pattern: RegExp, context: ValidationContext): string | null {
    if (value === null || pattern.test(value)) {
        return value;
    }

    const message = `"transport.${field}" becomes part of a request URL, so "${value}" may only contain letters, digits, dots, dashes, and underscores.`;

    context.error(INVALID_SEGMENT, message, `${SCOPE}.${field}`);

    return null;
}

function warnRemotePlaintext(host: string, context: ValidationContext): void {
    if (LOOPBACK_HOSTS.includes(host.toLowerCase())) {
        return;
    }

    const message = `The "http" transport sends its password to "${host}" without TLS. Prefer an SSH tunnel or a loopback host.`;

    context.warn(REMOTE_PLAINTEXT, message, `${SCOPE}.host`);
}

function resolvePassword(source: ManifestObject, context: ValidationContext): string | null {
    const passwordEnv = readString(source, 'passwordEnv');
    const password = readString(source, 'password');

    if (passwordEnv !== null) {
        const resolved = context.env[passwordEnv];

        if (resolved === undefined || resolved.length === 0) {
            const message = `The environment variable "${passwordEnv}" named by "transport.passwordEnv" is not set.`;

            context.error(MISSING_SECRET, message, `${SCOPE}.passwordEnv`);

            return null;
        }

        return resolved;
    }

    if (password === null) {
        context.error(MISSING_FIELD, 'The "http" transport requires "transport.passwordEnv" or "transport.password".', SCOPE);

        return null;
    }

    context.warn(PLAINTEXT_PASSWORD, 'The "transport.password" field stores a secret in plain text. Prefer "transport.passwordEnv".', `${SCOPE}.password`);

    return password;
}

function requireField(value: string | null, field: string, context: ValidationContext): string | null {
    if (value !== null) {
        return value;
    }

    context.error(MISSING_FIELD, `The "http" transport requires "transport.${field}".`, SCOPE);

    return null;
}

function validateHttpTransport(source: ManifestObject, context: ValidationContext): TransportConfig {
    const declared = requireField(readString(source, 'resource'), 'resource', context);
    const resource = validateSegment(declared, 'resource', URL_SEGMENT, context);
    const username = requireField(readString(source, 'username'), 'username', context);
    const password = resolvePassword(source, context);
    const refreshFunction = validateSegment(readString(source, 'refreshFunction'), 'refreshFunction', URL_SEGMENT, context);
    const restartFunction = validateSegment(readString(source, 'restartFunction'), 'restartFunction', URL_SEGMENT, context);
    const host = validateSegment(readString(source, 'host'), 'host', URL_HOST, context);

    if (host !== null) {
        warnRemotePlaintext(host, context);
    }

    if (resource === null || username === null || password === null || refreshFunction === null || restartFunction === null || host === null) {
        return NONE_TRANSPORT;
    }

    return {
        kind: 'http',
        host,
        port: readNumber(source, 'port') ?? 0,
        resource,
        username,
        password,
        refreshFunction,
        restartFunction,
    };
}

export function validateTransport(source: ManifestObject | null, context: ValidationContext): TransportConfig {
    if (source === null || readString(source, 'kind') !== 'http') {
        return NONE_TRANSPORT;
    }

    return validateHttpTransport(source, context);
}
