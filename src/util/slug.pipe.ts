import { Pipe, PipeTransform } from '@angular/core';
import slugify from "slugify";

@Pipe({
  name: 'slug',
  standalone: true
})
export class SlugPipe implements PipeTransform {

  transform(value: string): string {
    return slugify(value);
  }

}
