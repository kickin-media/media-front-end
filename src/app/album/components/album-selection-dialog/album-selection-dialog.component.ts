import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { EventService } from "../../../../services/api/event.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Album } from "../../../../util/types";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { AsyncPipe, NgForOf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { TimestampPipe } from "../../../../pipes/timestamp.pipe";
import { MatListItemLine } from "@angular/material/list";

@Component({
  selector: 'album-selection-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    MatButtonModule,
    TimestampPipe,
    MatListItemLine,
  ],
  templateUrl: './album-selection-dialog.component.html',
  styleUrl: './album-selection-dialog.component.scss'
})
export class AlbumSelectionDialogComponent {

  protected albumField = new FormControl<Album | null>(null);

  constructor(
    public dialogRef: MatDialogRef<AlbumSelectionDialogComponent>,
    protected eventService: EventService,
  ) {
  }

  protected renderAlbum(album: Album): string {
    return album.name;
  }

}
