import { Injectable } from '@angular/core';
import { Photo } from "../util/types";

@Injectable({
  providedIn: 'root'
})
export class ImageQualityService {

  constructor() { }

  get previewQuality(): Exclude<keyof Photo["img_urls"], "original"> {
    return "small";
  }

}
