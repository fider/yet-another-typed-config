import { Config } from 'jest';

const config: Config = {
  rootDir: '..',
  verbose: true,
  collectCoverage: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  cache: false,
  maxWorkers: 1 // Required because of how envFile() test util is written
};

export default config;