import { Router } from 'express';
import { authRequired } from '../../middlewares/auth.js';
import { criarRateLimit } from '../../middlewares/security.js';
import { operationController as controller } from './operation.controller.js';
export const operationRoutes=Router();
operationRoutes.use(authRequired);
operationRoutes.get('/',criarRateLimit({janelaMs:60000,limite:30,prefixo:'operation-report',segmento:req=>req.auth.usuarioId}),controller.report);
operationRoutes.post('/registros',criarRateLimit({janelaMs:60000,limite:30,prefixo:'operation-record'}),controller.create);
operationRoutes.delete('/registros/:id',controller.remove);
