import { Pipe, PipeTransform } from '@angular/core';
import { Photo, PhotoDetailed } from "../util/types";

@Pipe({
  name: 'exif',
  standalone: true
})
export class ExifPipe implements PipeTransform {

  transform(
    photo: PhotoDetailed | Photo | null | undefined,
    ...fieldNames: string[]
  ): string | null {
    if (photo === null || photo === undefined) return null;
    if (!(photo as any).exif) return null;

    const exif = (photo as any).exif;
    const fields = fieldNames.map(field => exif[field]).filter(value => value !== null && value !== undefined);
    if (fields.length === 0) return null;

    return fields[0];
  }

}

@Pipe({
  name: 'exifShutterSpeed',
  standalone: true
})
export class ExifShutterSpeedPipe extends ExifPipe {

  override transform(
    photo: PhotoDetailed | Photo | null | undefined,
  ): string | null {
    if (photo === null || photo === undefined) return null;

    let value = super.transform(photo, "shutter_speed_value");
    if (value) {
      value = Math.pow(2, parseFloat(value)).toFixed(0);
      return `1 / ${value}`;
    }

    value = super.transform(photo, "exposure_time");
    if (value) {
      value = (1 / parseFloat(value)).toFixed(0);
      return `1 / ${value}`;
    }

    return null;
  }

}
