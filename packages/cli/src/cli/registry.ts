import { registerBuildCommand } from '@cli/cli/registry/build-registration';
import { registerCheckCommand } from '@cli/cli/registry/check-registration';
import { registerConfigCommand } from '@cli/cli/registry/config-registration';
import { registerDevCommand } from '@cli/cli/registry/dev-registration';
import { registerDoctorCommand } from '@cli/cli/registry/doctor-registration';
import { registerEnsureCommand } from '@cli/cli/registry/ensure-registration';
import { registerFormatCommand } from '@cli/cli/registry/format-registration';
import { registerInitCommand } from '@cli/cli/registry/init-registration';
import { registerSetupCommand } from '@cli/cli/registry/setup-registration';
import { registerServerCommand } from '@cli/cli/registry/server-registration';
import { registerTestCommand } from '@cli/cli/registry/test-registration';
import { registerTraceCommand } from '@cli/cli/registry/trace-registration';

import type { CliRuntime } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

export type CommandRegistrar = (program: Command, runtime: CliRuntime) => void;

export const COMMAND_REGISTRARS: readonly CommandRegistrar[] = [
    registerBuildCommand,
    registerCheckCommand,
    registerConfigCommand,
    registerDevCommand,
    registerDoctorCommand,
    registerEnsureCommand,
    registerFormatCommand,
    registerInitCommand,
    registerServerCommand,
    registerSetupCommand,
    registerTestCommand,
    registerTraceCommand,
];
