import { Config } from "../config";

export class ConfigService {

  constructor(public readonly config: Config<any>) {
  }

}
