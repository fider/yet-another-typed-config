const META_PREFIX = 'library:yet-another-typed-config';
const META_KEY = `${META_PREFIX}:property-mapping`;

type MetaMapping = Array<{
  envName: string;
  propertyName: string;
}>;

export function setPropertyMapping(opts: { classPrototype: object, envKeyName: string, configPropertyName: string }) {
  const meta: MetaMapping = Reflect.getMetadata(
    META_KEY,
    opts.classPrototype
  ) ?? [];

  meta.push({
    envName: opts.envKeyName,
    propertyName: opts.configPropertyName
  });

  Reflect.defineMetadata(
    META_KEY,
    meta,
    opts.classPrototype
  );
}

export function getPropertyMapping(theClass: new () => object) {
  const meta: MetaMapping = Reflect.getMetadata(
    META_KEY,
    theClass.prototype
  ) ?? [];

  return meta;
}
