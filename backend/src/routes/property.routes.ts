import { Router } from 'express';
import * as controller from '../controllers/property.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPropertySchema, listPropertiesSchema, updatePropertySchema } from '../validators/property';

const router = Router();

router.get('/', validate(listPropertiesSchema), controller.list);
router.get('/:id', controller.getOne);
router.get('/:id/similar', controller.similar);

router.post('/', requireAuth, validate(createPropertySchema), controller.create);
router.put('/:id', requireAuth, validate(updatePropertySchema), controller.update);
router.delete('/:id', requireAuth, controller.remove);

export default router;
