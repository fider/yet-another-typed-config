import { IsOptional } from "class-validator";
import { markPropertyAsOptional } from "../helpers/helper";

export function optionalDecorator(target: object, key: string) {
  IsOptional()(target, key);
  markPropertyAsOptional(target, key);
}
