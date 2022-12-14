import { join } from "path";
import { env, getConfig } from "../app"
import { expectOk } from "./test.util"
import * as fs from "fs/promises";
import { Stats } from "fs";

class EnvSchema {
  @env.string()
  TEST_ENV!: string;
}

const expectedOk: EnvSchema = {
  TEST_ENV: 'ok',
};

test('Absolute ENV_FILE', () => {
  process.env.ENV_FILE = join(__dirname, 'test-env-dir/.env');
  expectOk(EnvSchema, { TEST_ENV: 'ok' });
})

test('Relative ENV_FILE', () => {
  jest.spyOn(process, 'cwd').mockReturnValueOnce(__dirname);
  process.env.ENV_FILE = 'test-env-dir/.env';
  expectOk(EnvSchema, { TEST_ENV: 'ok' });
})

test('ENV_FILE not set. Search for `.env` in process.cwd()', () => {
  jest.spyOn(process, 'cwd').mockReturnValueOnce(join(__dirname, 'test-env-dir'));

  // When you set  process.env.ENV_FILE=undefined  then  process.env.ENV_FILE='undefined' string literal.
  delete process.env.ENV_FILE;
  
  expectOk(EnvSchema, { TEST_ENV: 'ok' });
})

test('ENV_FILE not found', () => {
  jest.spyOn(process, 'cwd').mockReturnValueOnce(__dirname);
  process.env.ENV_FILE = 'test-env-dir/.not-existing.env';
  expect(() => getConfig(EnvSchema)).toThrow();
})

test('No permissions to read .env file', async () => {
  const envFileValue = 'test-env-dir/.no-permissions.env';
  process.env.ENV_FILE = envFileValue;

  const envFilePath = join(__dirname, envFileValue);

  jest.spyOn(process, 'cwd').mockReturnValue(__dirname);
  
  await fs.chmod(envFilePath, '222');
  expect(() => getConfig(EnvSchema)).toThrow();
  await fs.chmod(envFilePath, '666');
  expect(getConfig(EnvSchema)).toEqual({ TEST_ENV: 'ok' });
})

test('ENV_FILE is direcotry', () => {
  jest.spyOn(process, 'cwd').mockReturnValueOnce(__dirname);
  process.env.ENV_FILE = 'test-env-dir/';
  expect(() => getConfig(EnvSchema)).toThrow();
})
