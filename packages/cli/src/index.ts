#!/usr/bin/env node
import { runCli } from '@cli/cli/dispatch';

process.exitCode = await runCli(process.argv.slice(2));
