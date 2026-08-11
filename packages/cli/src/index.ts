#!/usr/bin/env node
import { runCli } from '@cli/cli/run';

process.exitCode = await runCli(process.argv.slice(2));
