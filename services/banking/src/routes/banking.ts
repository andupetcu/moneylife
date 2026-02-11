import { Router } from 'express';
import { wrap } from '../utils/wrap';
import * as plaidController from '../controllers/plaid';
import * as truelayerController from '../controllers/truelayer';
import * as saltEdgeController from '../controllers/salt-edge';
import * as mirrorController from '../controllers/mirror-mode';

export const bankingRouter = Router();

bankingRouter.post('/link', wrap(plaidController.createLinkToken));
bankingRouter.post('/callback', wrap(plaidController.exchangePublicToken));
bankingRouter.post('/truelayer/auth', wrap(truelayerController.generateAuthUrl));
bankingRouter.post('/truelayer/callback', wrap(truelayerController.exchangeCode));
bankingRouter.post('/saltedge/connect', wrap(saltEdgeController.createConnectSession));
bankingRouter.post('/saltedge/callback', wrap(saltEdgeController.handleCallback));
bankingRouter.get('/accounts', wrap(plaidController.getAccounts));
bankingRouter.get('/transactions', wrap(plaidController.getTransactions));
bankingRouter.delete('/accounts/:id', wrap(plaidController.disconnectAccount));
bankingRouter.get('/mirror-comparison', wrap(mirrorController.getMirrorComparison));
bankingRouter.post('/webhooks/plaid', wrap(plaidController.handleWebhook));
