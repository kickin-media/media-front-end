import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { readAndCompressImage } from "browser-image-resizer";
import validateExif, { ExifWarning, ExifWarningType } from "../../../../util/validate-exif";
import { NgForOf, NgIf } from "@angular/common";
import { MatBadgeModule } from "@angular/material/badge";
import { SkeletonComponent } from "../../../../components/skeleton/skeleton.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

const PREVIEW_CONFIG = {
  quality: 0.7,
  maxWidth: 400,
  maxHeight: 400,
};

@Component({
  selector: 'upload-grid',
  standalone: true,
  imports: [
    NgForOf,
    MatBadgeModule,
    SkeletonComponent,
    MatTooltipModule,
    NgIf,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './upload-grid.component.html',
  styleUrl: './upload-grid.component.scss'
})
export class UploadGridComponent implements OnChanges, OnDestroy {

  @Input() photos: File[] = [];

  @Output() removeFile: EventEmitter<File> = new EventEmitter();

  protected readonly previews: { [key: string]: string } = {};
  protected previewQueue: File[] = [];
  protected previewWorker: number | null = null; // NodeJS.Timeout

  protected readonly warnings: { [key: string]: ExifWarning[] } = {};

  constructor() {
    // Bind the method to this class instance (needed for Higher-Order-Function
    // in `setTimeout(...)`)
    this.loadPreview = this.loadPreview.bind(this);
  }

  loadPreview() {
    // Get the next item from the queue
    const item = this.previewQueue.shift();

    if (!item) return;
    if (this.photos.indexOf(item) === -1) return;

    // Generate the preview & do some further processing...
    readAndCompressImage(item, PREVIEW_CONFIG).then(blob => {
      // Set the preview
      this.previews[item.name] = URL.createObjectURL(blob);

      // Then load & validate the exif data
      return validateExif(item);
    }).then(warnings => {
      this.warnings[item.name] = warnings;
    }).then(() => {
      // If there are still some items in the queue, then schedule
      // the next item
      if (this.previewQueue.length > 0) {
        // @ts-ignore
        this.previewWorker = setTimeout(this.loadPreview, 50);
      } else {
        // Otherwise, let the process die...
        this.previewWorker = null;
      }
    });
  }

  getBadgeCount(file: File): number | undefined {
    if (!this.warnings[file.name]) return undefined;

    const warnings = this.warnings[file.name];
    if (warnings.length === 0) return undefined;
    else return warnings.length;
  }

  getTooltip(file: File): string {
    return file.name;
  }

  canUpload(): boolean {
    const criticalWarnings = Object.values(this.warnings).flat().some(warn => warn.critical);
    return this.photos.length > 0 && this.previewWorker === null && !criticalWarnings;
  }

  hasWarning(warningType: ExifWarningType): number | false {
    const warnings = Object.values(this.warnings).flat();
    const count = warnings.filter(warning => warning.type === warningType).length;
    if (count === 0) return false;
    else return count;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes["photos"]) return;
    const oldFiles: File[] = changes["photos"].previousValue ?? [];
    const newFiles: File[] = changes["photos"].currentValue;

    // Determine which of the files were added and removed by the changes
    const removedFiles = oldFiles.filter(file => newFiles.indexOf(file) === -1);
    const addedFiles = newFiles.filter(file => oldFiles.indexOf(file) === -1);

    // Un-load the removed files
    for (const file of removedFiles) {
      URL.revokeObjectURL(this.previews[file.name]);
      delete this.previews[file.name];
      delete this.warnings[file.name];
    }

    // Add the added files to the queue for loading previews
    for (const file of addedFiles) {
      this.previewQueue.push(file);
    }

    // If there is no current worker fetching images, then start a new one
    if (this.previewWorker === null && this.previewQueue.length > 0) {
      setTimeout(this.loadPreview, 50);
    }
  }

  ngOnDestroy(): void {
    // Clear the queue
    this.previewQueue = []

    // Cancel processing...
    if (this.previewWorker !== null) clearTimeout(this.previewWorker);

    // Revoke all previews
    for (const file of this.photos) {
      URL.revokeObjectURL(this.previews[file.name]);
    }
  }

}
