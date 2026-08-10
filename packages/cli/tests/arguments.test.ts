import { describe, expect, it } from 'vitest';

import { parseArguments } from '@cli/cli/arguments';

describe('argument parsing', () => {
    it('reads a command with no options', () => {
        const parsed = parseArguments(['build']);

        expect(parsed.command).toBe('build');
        expect(parsed.errors).toEqual([]);
        expect(parsed.watch).toBeNull();
    });

    it('reads the development command', () => {
        expect(parseArguments(['dev', '--no-watch'])).toMatchObject({ command: 'dev', watch: false, errors: [] });
    });

    it('reads setup confirmation', () => {
        expect(parseArguments(['setup', '--yes'])).toMatchObject({ command: 'setup', yes: true, errors: [] });
        expect(parseArguments(['setup', '-y'])).toMatchObject({ command: 'setup', yes: true, errors: [] });
    });

    it('reads value options', () => {
        const parsed = parseArguments(['check', '--cwd', 'projects/demo', '--config', 'luam.dev.json']);

        expect(parsed.cwd).toBe('projects/demo');
        expect(parsed.config).toBe('luam.dev.json');
        expect(parsed.errors).toEqual([]);
    });

    it('reads the init options', () => {
        const parsed = parseArguments(['init', '--name', 'my-resource', '--force']);

        expect(parsed.command).toBe('init');
        expect(parsed.name).toBe('my-resource');
        expect(parsed.force).toBe(true);
        expect(parsed.errors).toEqual([]);
    });

    it('reads the watch switches', () => {
        expect(parseArguments(['ensure', '--watch']).watch).toBe(true);
        expect(parseArguments(['ensure', '--no-watch']).watch).toBe(false);
    });

    it('reads help and version flags', () => {
        expect(parseArguments(['--help']).help).toBe(true);
        expect(parseArguments(['-h']).help).toBe(true);
        expect(parseArguments(['--version']).version).toBe(true);
        expect(parseArguments(['-v']).version).toBe(true);
    });

    it('rejects an unknown command', () => {
        expect(parseArguments(['deploy']).errors).toEqual([
            '"deploy" is not a known command. Use "build", "check", "dev", "doctor", "ensure", "init", "setup".',
        ]);
    });

    it('rejects an unknown option', () => {
        expect(parseArguments(['build', '--fast']).errors).toEqual(['"--fast" is not a known option.']);
    });

    it('rejects a second command', () => {
        expect(parseArguments(['build', 'check']).errors).toEqual(['"check" is unexpected because the command is already "build".']);
    });

    it('rejects a value option without a value', () => {
        expect(parseArguments(['build', '--cwd']).errors).toEqual(['The "--cwd" option requires a value.']);
        expect(parseArguments(['build', '--cwd', '--watch']).errors).toEqual(['The "--cwd" option requires a value.']);
    });
});
