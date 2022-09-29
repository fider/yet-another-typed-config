import { ValidationError, ValidatorOptions } from 'class-validator';
import { transformAndValidateSync } from 'class-transformer-validator';
import dotenv from 'dotenv';
import { isAbsolute, join } from 'path';
import { isPropertyMarkedAsOptional } from './helpers/helper';
import { EnvError } from './env.error';
import { lstatSync, Stats } from 'fs';
import fs from 'fs';
import { getPropertyMapping } from './helpers/property-mapping';
import deepCopy from 'deep-copy';

export type GetConfigOpts = {
  /**
   * If `true` then your `.env` file may contain variables unknown to `ConfigSchema` (`getConfig(ConfigSchema)`).
   * 
   * The only source for your `config` object is your `.env` file. `process.env` have no impact on your config object.
   * 
   * `Default: false`
   */
  allowUnknown?: boolean;


}

/**
 * Usage:
 * 
 * - `$ node app.js`: requires to have `.env` file in your `process.cwd()` direcory
 * - `$ cross-env ENV_FILE=./dev.env  node app.js`: use other env file. `ENV_FILE` accepts relative or absole path  (relative to `process.cwd()`)
 * 
 */
export function getConfig<T extends object>(ConfigSchema: new () => T, opts?: GetConfigOpts): T {
  const envFilePath = determineEnvFilePath();

  const parsedRawEnv = parseEnvFile({ path: envFilePath });

  const mappedRawEnv = mapEnvKeys({ parsedRawEnv, theClass: ConfigSchema });

  let config = new ConfigSchema();
  Object.assign(config, mappedRawEnv);

  // TODO continue here
  //   assign appropriate classes to objects with help of metadata that objectDecorator will set

  const forbidUnknownProperties = !(opts?.allowUnknown ?? false);
  const validatorOptions: ValidatorOptions = {
    forbidNonWhitelisted: forbidUnknownProperties,
    whitelist: forbidUnknownProperties,
  }
  try {
    config = transformAndValidateSync(ConfigSchema, config, { validator: validatorOptions, transformer: { strategy: 'exposeAll'} });
  } catch (err) {
    // TODO replace with Object.getPrototypeOf(err[0]).constructor.name === 'ValidationError'
    if (Array.isArray(err) && err[0] instanceof ValidationError) {
      const detailsList: ConstructorParameters<typeof EnvError>[number] = (err as ValidationError[]).map(validationError => {
        const isOptional = isPropertyMarkedAsOptional(Object.getPrototypeOf(config), validationError.property);

        const theClass = Object.getPrototypeOf(validationError.target).constructor;
        const defaultValue = (new theClass())[validationError.property];

        return {
          configPropertyName: validationError.property,
          constraints: validationError.constraints || {},
          value: validationError.value,
          defaultValue,
          isOptional,
          targetObject: validationError.target as object
        }
      });
      
      throw new EnvError(detailsList)
    }

    throw err;
  }

  return config; 
}

function determineEnvFilePath(): string {
  const ENV_FILE = process.env.ENV_FILE;
  let envFilePath: string | undefined;

  const processCwd = process.cwd();

  if (ENV_FILE) {
    envFilePath = isAbsolute(ENV_FILE) ? ENV_FILE : join(processCwd, ENV_FILE);
  } else {
    envFilePath = join(processCwd, '.env');
  }

  if (!canSeeFileSync(envFilePath)) {
    throw new Error(`Configuration file does not exists or is not visible to your process: "${envFilePath}"`);
  }

  if (!canReadFileSync(envFilePath)) {
    throw new Error(`Process do not have permissions to read file: "${envFilePath}"`);
  }

  if (isDirectorySync(envFilePath)) {
    throw new Error(`Configuration file seems to be a directory, not file: "${envFilePath}"`);
  }

  return envFilePath;
}

function canSeeFileSync(path: string): boolean {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (err) {
    if ((err as any).code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
}

function canReadFileSync(path: string) {
  try {
    fs.accessSync(path, fs.constants.R_OK);
    return true;
  } catch (err) {
    return false;
  }
}

function isDirectorySync(path: string): boolean {
  const stats =  fs.statSync(path);
  return stats.isDirectory();
}

function parseEnvFile(opts: { path: string, encoding?: BufferEncoding }) {
  const { parsed: parsedEnv, error } = dotenv.config(opts);

  if (error) {
    throw error;
  }

  return parsedEnv as Record<string, string>;
}

function mapEnvKeys(opts: { parsedRawEnv: Record<string, string>, theClass: new () => object }) {
  const { parsedRawEnv, theClass } = opts;
  const parsedRawEnvNotInMap = deepCopy(parsedRawEnv);

  let mapped: Record<string, any> = {};

  const propertyMapping = getPropertyMapping(theClass);

  propertyMapping.forEach(mapping => {
    const rawValue: string | undefined = parsedRawEnv[mapping.envName];
    
    if (rawValue !== undefined) {
      mapped[mapping.propertyName] = rawValue;
    }

    delete parsedRawEnvNotInMap[mapping.envName];
  });

  mapped = Object.assign(parsedRawEnvNotInMap, mapped);

  return mapped;
}