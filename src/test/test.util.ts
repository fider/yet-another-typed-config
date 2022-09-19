import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { getConfig, GetConfigOpts } from '../app';
import { EnvError } from '../app/env.error';

let filesCount = 0;

/**
 * Stores content in temporary file and set `process.env.ENV_FILE=tmp.env` so `getConfig` can read `tmp.env`.
 */
export function envFile(dotEnvContent: string): void {
  filesCount += 1;
  const path = join(tmpdir(), `config-pro--dot-env--for-tests-no-${filesCount}`);
  writeFileSync(path, dotEnvContent);
  process.env.ENV_FILE=path;
}

export function expectOk(EnvSchema: new () => object, expected: object, opts?: GetConfigOpts) {
  const config = getConfig(EnvSchema, opts);
  expect(config).toEqual(expected);
}

export function expectEnvError<T extends object>(EnvSchema: new () => T, expectedMessage: string, opts?: GetConfigOpts) {
  let error: any;

  try {
    getConfig(EnvSchema, opts);
  } catch (err) {
    error = err as EnvError;
  }

  if (error === undefined) {
    throw new Error('Expected config validation error, however it succeed.');
  }

  expect(error).toBeInstanceOf(EnvError);
  expect(error.message).toEqual(expectedMessage);
}

export function trimEachLine(str: string) {
  return str.replace(/^\s*(\S.*\S|\S)\s*$/gm, '$1');
}
