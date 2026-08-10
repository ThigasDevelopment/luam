import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';

import { startServer } from '@lsp/server/server';

startServer(createConnection(ProposedFeatures.all));
