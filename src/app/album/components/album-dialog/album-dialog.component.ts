import { Component, Inject } from '@angular/core';
import { AlbumCreate, AlbumDetailed, AlbumUpdate, PhotoEvent } from "../../../../util/types";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { AlbumService } from "../../../../services/api/album.service";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { EventService } from "../../../../services/api/event.service";
import { MatSelectModule } from "@angular/material/select";
import { AsyncPipe, NgForOf } from "@angular/common";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatetimepickerModule } from "@mat-datetimepicker/core";
import { MatMomentDatetimeModule } from "@mat-datetimepicker/moment";
import { MatIconModule } from "@angular/material/icon";
import { combineLatest, share, switchMap } from "rxjs";
import { serializeDate } from "../../../../util/date";

@Component({
  selector: 'app-album-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSelectModule,
    AsyncPipe,
    NgForOf,
    MatCheckboxModule,
    MatMomentDatetimeModule,
    MatDatetimepickerModule,
  ],
  templateUrl: './album-dialog.component.html',
  styleUrl: './album-dialog.component.scss'
})
export class AlbumDialogComponent {

  protected nameField = new FormControl<string | null>(null);
  protected eventField = new FormControl<string | null>(null);
  protected dateField = new FormControl<Date>(new Date());

  protected secretField = new FormControl<boolean>(false);
  protected scheduledReleaseField = new FormControl<Date | null>(null);

  constructor(
    protected dialogRef: MatDialogRef<AlbumDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlbumDialogProps,
    protected albumService: AlbumService,
    protected eventService: EventService,
  ) {
    if (data.event) {
      this.eventField.setValue(data.event.id);
      this.eventField.disable();
    }

    if (data.album) {
      this.nameField.setValue(data.album.name);
      this.eventField.setValue(data.album.event_id);
      this.dateField.setValue(new Date(data.album.timestamp));
      this.secretField.setValue(data.album.hidden_secret !== undefined && data.album.hidden_secret !== null);
      if (data.album.release_time) this.scheduledReleaseField.setValue(new Date(data.album.release_time));

      this.eventField.disable();
    }
  }

  resetReleaseDate(e: MouseEvent) {
    this.scheduledReleaseField.setValue(null);
    e.stopPropagation();
  }

  canSubmit(): boolean {
    const name = this.nameField.value;
    if (name === null) return false;
    if (name.length === 0) return false;

    const eventId = this.eventField.value;
    if (eventId === null) return false;

    const date = this.dateField.value;
    if (date === null) return false;

    const secret = this.secretField.value;
    return secret !== null;
  }

  submit() {
    if (!this.canSubmit()) return;

    const releaseDate = this.scheduledReleaseField.value;

    const data: AlbumCreate | AlbumUpdate = {
      name: this.nameField.value as string,
      event_id: this.eventField.value as string,
      timestamp: serializeDate(this.dateField.value as Date),
      release_time: releaseDate ? serializeDate(releaseDate) : null,
    };

    const saveAction$ = (
      this.data.album
        ? this.albumService.update(this.data.album.id, data)
        : this.albumService.create(data)
    ).pipe(share());

    const secretAction$ = saveAction$.pipe(
      switchMap(album => this.albumService.setSecretStatus(
        album.id,
        this.secretField.value ?? false,
      )),
    );

    combineLatest([saveAction$, secretAction$])
      .subscribe(([album, _]) => this.dialogRef.close(album));
  }

}

export interface AlbumDialogProps {
  album?: AlbumDetailed;
  event?: PhotoEvent;
}
