import { env } from "../app"
import { envFile, trimEachLine, expectEnvError, expectOk } from "./test.util"

test('Unknow environmet variable', () => {
  envFile(`
    KNOWN=ok
    I_AM_UNKNOWN=haha
  `)

  class EnvSchema {
    @env.string()
    KNOWN!: string;
  }

  const expectedOk: EnvSchema & { I_AM_UNKNOWN: string }= {
    KNOWN: 'ok',
    I_AM_UNKNOWN: 'haha'
  }

  const expectedEnvError = trimEachLine(`Invalid environment variables provided:
    - I_AM_UNKNOWN (Actual value=\"haha\"): it is unexpected environemnt variable. Fix: do not set this env variable OR provide additional option to \`getConfig(ConfigSchema, { allowUnknown: true })\`.`
  );

  expectOk(EnvSchema, expectedOk, { allowUnknown: true });
  expectFail(() => expectOk(EnvSchema, expectedOk, { allowUnknown: false }));
  expectFail(() => expectOk(EnvSchema, expectedOk, { allowUnknown: undefined }));

  expectFail(() =>  expectEnvError(EnvSchema, expectedEnvError, { allowUnknown: true }));
  expectEnvError(EnvSchema, expectedEnvError, { allowUnknown: false });
  expectEnvError(EnvSchema, expectedEnvError, { allowUnknown: undefined });
})
// ==============================================================
//  Helper
//
function expectFail(func: () => any) {
  let funcError;

  try {
    func();
  } catch (err) {
    funcError = err;
  }

  if (!funcError) {
    throw new Error('Expected failure, however it succeed.');
  }
}
