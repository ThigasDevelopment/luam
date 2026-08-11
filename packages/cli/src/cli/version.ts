declare const LUAM_VERSION: string | undefined;

export const VERSION = typeof LUAM_VERSION === 'string' ? LUAM_VERSION : '0.0.0-dev';

export const PROGRAM_NAME = 'luam';

export const PROGRAM_DESCRIPTION = 'luam — the Luam compiler for Multi Theft Auto resources.';
