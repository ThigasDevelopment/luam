import {
    DEFAULT_HTTP_HOST,
    DEFAULT_HTTP_PORT,
    DEFAULT_REFRESH_FUNCTION,
    DEFAULT_RESTART_FUNCTION,
    NONE_TRANSPORT,
    type TransportConfig,
} from '@cli/config/config-schema';
import { readNumber, readString, rejectUnknownFields, type RawObject } from '@cli/config/value-readers';
import { cliError, cliWarning, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';

export type Environment = Readonly<Record<string, string | undefined>>;

const KNOWN_FIELDS = ['kind', 'host', 'port', 'resource', 'username', 'password', 'passwordEnv', 'refreshFunction', 'restartFunction'];

const MISSING_FIELD = 'config-missing-field';

const INVALID_TRANSPORT = 'config-invalid-transport';

const PLAINTEXT_PASSWORD = 'config-plaintext-password';

const MISSING_SECRET = 'config-missing-secret';

const INVALID_SEGMENT = 'config-invalid-url-segment';

const REMOTE_PLAINTEXT = 'config-remote-plaintext-transport';

const URL_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const URL_HOST = /^[A-Za-z0-9._[\]:-]+$/;

const LOOPBACK_HOSTS: readonly string[] = ['localhost', '127.0.0.1', '::1', '[::1]'];

function validateSegment(value: string | null, field: string, pattern: RegExp, diagnostics: CliDiagnostic[]): string | null {
    if (value === null || pattern.test(value)) {
        return value;
    }

    const message = `"transport.${field}" becomes part of a request URL, so "${value}" may only contain letters, digits, dots, dashes, and underscores.`;

    diagnostics.push(cliError(INVALID_SEGMENT, message));

    return null;
}

function warnRemotePlaintext(host: string, diagnostics: CliDiagnostic[]): void {
    if (LOOPBACK_HOSTS.includes(host.toLowerCase())) {
        return;
    }

    const message = `The "http" transport sends its password to "${host}" without TLS. Prefer an SSH tunnel or a loopback host.`;

    diagnostics.push(cliWarning(REMOTE_PLAINTEXT, message));
}

function resolvePassword(source: RawObject, diagnostics: CliDiagnostic[], env: Environment): string | null {
    const passwordEnv = readString(source, 'passwordEnv', diagnostics);
    const password = readString(source, 'password', diagnostics);

    if (passwordEnv !== null) {
        const resolved = env[passwordEnv];

        if (resolved === undefined || resolved.length === 0) {
            diagnostics.push(cliError(MISSING_SECRET, `The environment variable "${passwordEnv}" named by "transport.passwordEnv" is not set.`));

            return null;
        }

        return resolved;
    }

    if (password === null) {
        diagnostics.push(cliError(MISSING_FIELD, 'The "http" transport requires "transport.passwordEnv" or "transport.password".'));

        return null;
    }

    diagnostics.push(cliWarning(PLAINTEXT_PASSWORD, 'The "transport.password" field stores a secret in plain text. Prefer "transport.passwordEnv".'));

    return password;
}

function requireField(value: string | null, field: string, diagnostics: CliDiagnostic[]): string | null {
    if (value !== null) {
        return value;
    }

    diagnostics.push(cliError(MISSING_FIELD, `The "http" transport requires "transport.${field}".`));

    return null;
}

function validateHttpTransport(source: RawObject, diagnostics: CliDiagnostic[], env: Environment): TransportConfig {
    const declared = requireField(readString(source, 'resource', diagnostics), 'resource', diagnostics);
    const resource = validateSegment(declared, 'resource', URL_SEGMENT, diagnostics);
    const username = requireField(readString(source, 'username', diagnostics), 'username', diagnostics);
    const password = resolvePassword(source, diagnostics, env);
    const refresh = readString(source, 'refreshFunction', diagnostics) ?? DEFAULT_REFRESH_FUNCTION;
    const restart = readString(source, 'restartFunction', diagnostics) ?? DEFAULT_RESTART_FUNCTION;
    const refreshFunction = validateSegment(refresh, 'refreshFunction', URL_SEGMENT, diagnostics);
    const restartFunction = validateSegment(restart, 'restartFunction', URL_SEGMENT, diagnostics);
    const host = validateSegment(readString(source, 'host', diagnostics) ?? DEFAULT_HTTP_HOST, 'host', URL_HOST, diagnostics);

    if (host !== null) {
        warnRemotePlaintext(host, diagnostics);
    }

    if (resource === null || username === null || password === null || refreshFunction === null || restartFunction === null || host === null) {
        return NONE_TRANSPORT;
    }

    return {
        kind: 'http',
        host,
        port: readNumber(source, 'port', diagnostics) ?? DEFAULT_HTTP_PORT,
        resource,
        username,
        password,
        refreshFunction,
        restartFunction,
    };
}

export function validateTransport(source: RawObject | null, diagnostics: CliDiagnostic[], env: Environment): TransportConfig {
    if (source === null) {
        return NONE_TRANSPORT;
    }

    rejectUnknownFields(source, KNOWN_FIELDS, 'transport.', diagnostics);

    const kind = readString(source, 'kind', diagnostics) ?? 'none';

    if (kind === 'none') {
        return NONE_TRANSPORT;
    }

    if (kind !== 'http') {
        diagnostics.push(cliError(INVALID_TRANSPORT, `"transport.kind" must be "none" or "http" but received "${kind}".`));

        return NONE_TRANSPORT;
    }

    return validateHttpTransport(source, diagnostics, env);
}
