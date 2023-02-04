import { Dictionary } from '@mikro-orm/core';
import { IPrimaryKeyValue } from '@mikro-orm/core/typings';
import { NotFound } from '@panenco/papi';

export const noEntityFoundError = function (entityName: string, where: Dictionary<any> | IPrimaryKeyValue): Error {
  throw new NotFound(`entityNotFound`, `${entityName} ${NotFound.name}`);
};