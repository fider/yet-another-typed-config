import deepEqual from 'deep-equal';
import { getPropertyMapping } from './helpers/property-mapping';

export class EnvError extends Error {
  public details: EnvErrorDetails[];

  constructor(detailsList: Array<{
    configPropertyName: string;
    value: Value;
    defaultValue: Value;
    isOptional: boolean;
    constraints: Record<string, string>;
    targetObject: object;
  }>) {
    super();
    this.details = detailsList.map(detail => {
      const propertyMappings = getPropertyMapping(Object.getPrototypeOf(detail.targetObject).constructor);
      const envName = propertyMappings.find((mapping) => mapping.propertyName === detail.configPropertyName)?.envName || detail.configPropertyName;
      const propertyPrefix = envName === detail.configPropertyName ? envName : `${envName} mapped to config ${detail.configPropertyName}`;

      const errorMessageList = Object.values(detail.constraints).map(mapIfUnknownPropertyError);
      const valueQuote = typeof detail.value === 'string' ? '"' : '';
      const property = `${propertyPrefix} (Actual value=${valueQuote}${detail.value}${valueQuote})`;
      const optional = detail.isOptional ? ' is optional but if set then' : ''
      const allErrors = errorMessageList.join(' AND ');

      let isInvalidDefaultValue = false;
      let message = `${property}${optional}: ${allErrors}`;

      if (detail.defaultValue !== undefined && deepEqual(detail.value, detail.defaultValue)) {
        // Inform user that bad default was set by developer
        const defaultValueQuote = typeof detail.defaultValue === 'string' ? '"' : '';
        message = `${property}. It is optional but it defaults to invalid value=${defaultValueQuote}${detail.defaultValue}${defaultValueQuote} that should be changed by developer in ConfigSchema. For now you can just overwrite it by environment variable. Problem: ${allErrors}`
        
        isInvalidDefaultValue = true;
      }

      errorMessageList.push(`invalid default value set`);

      return {
        configName: detail.configPropertyName,
        envName,
        actualValue: detail.value,
        defaultValue: detail.defaultValue,
        isOptional: detail.isOptional,
        errorMessageList,
        message,
      };
    })

    let messageDetails = this.details.map(details => {
      return `- ${details.message}.`
    }).join('\n');

    this.message = `Invalid environment variables provided:\n${messageDetails}`
  }
}

type EnvErrorDetails = {
  envName: string;
  configName: string;
  actualValue: Value;
  defaultValue: Value;
  isOptional: boolean;
  /** Complete, human readable error message that concerns specific environment variable */
  message: string;
  errorMessageList: string[];
}

type Value = boolean | number | string | undefined | boolean[] | number[] | string[] | undefined[];

const unknwonPropetyRegExp = /^property (\S+) should not exist$/;
function mapIfUnknownPropertyError(message: string): string {
  if (unknwonPropetyRegExp.test(message)) {
    return `it is unexpected environemnt variable. Fix: do not set this env variable OR provide additional option to \`getConfig(ConfigSchema, { allowUnknown: true })\``
  }
  return message;
}