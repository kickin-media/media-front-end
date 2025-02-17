import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { AlbumService } from "../../services/api/album.service";
import { MatIconModule } from "@angular/material/icon";
import { AsyncPipe, NgIf, NgStyle } from "@angular/common";
import { UploadGridComponent } from "./components/upload-grid/upload-grid.component";
import { MatDividerModule } from "@angular/material/divider";
import { EXIF_WARNING_MESSAGES, ExifWarningType } from "../../util/validate-exif";
import { ExifWarningPipe } from "../../pipes/exif.pipe";
import { filter, first, Observable, of, shareReplay, startWith, switchMap } from "rxjs";
import { PhotoService, PhotoUploadStatus } from "../../services/api/photo.service";
import { MatProgressBarModule } from "@angular/material/progress-bar";

@Component({
  selector: 'upload-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
    UploadGridComponent,
    MatDividerModule,
    NgIf,
    ExifWarningPipe,
    MatProgressBarModule,
    NgStyle,
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadDialog {

  protected files: File[] = [];
  protected status: Observable<PhotoUploadStatus> | null = null;
  protected hadUploadErrors: boolean = false;

  constructor(
    protected dialogRef: MatDialogRef<UploadDialog>,
    protected albumService: AlbumService,
    protected photoService: PhotoService,
  ) { }

  onSelectFiles(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const files = [];
    for (let i = 0; i < target.files.length; i++) {
      const file = target.files[i];
      files.push(file);
    }

    this.files = [...this.files, ...files];
  }

  onSubmit() {
    this.status = this.albumService.id$.pipe(
      filter(id => id !== null),
      first(),
      switchMap(albumId => this.photoService.upload(albumId, this.files)),
      shareReplay(1),
      startWith({ successes: 0, errors: [], total: 0, remaining: this.files.length } as PhotoUploadStatus),
    );

    this.status.subscribe(res => {
      if (res.remaining > 0) return;
      if (res.errors.length === 0) {
        this.dialogRef.close();
        return;
      }

      this.hadUploadErrors = true;
      this.files = res.errors;
    });
  }

  removeFile(file: File) {
    const index = this.files.indexOf(file);
    if (index < 0) return;

    this.files = [
      ...this.files.slice(0, index),
      ...this.files.slice(index + 1),
    ]
  }

  get exifWarningTypes(): ExifWarningType[] {
    // @ts-ignore
    return Object.keys(EXIF_WARNING_MESSAGES);
  }

}
