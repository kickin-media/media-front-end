import { Component, Inject } from '@angular/core';
import { EventCreate, EventUpdate, PhotoEvent } from "../../../../util/types";
import { EventService } from "../../../../services/api/event.service";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { AsyncPipe, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ButtonGroupComponent } from "../../../components/button-group/button-group.component";
import { MatIconModule } from "@angular/material/icon";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { combineLatest, isObservable, map, Observable, of, shareReplay, startWith, switchMap, tap } from "rxjs";
import { readAndCompressImage, Config as PreviewConfig } from "browser-image-resizer";
import { fromPromise } from "rxjs/internal/observable/innerFrom";

const previewConfig: PreviewConfig = {
  quality: 0.7,
  maxWidth: 400,
  maxHeight: 400,
  mimeType: "image/png",
};

@Component({
  selector: 'event-dialog',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,

    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,

    ButtonGroupComponent,
    AsyncPipe,
  ],
  templateUrl: './event-dialog.component.html',
  styleUrl: './event-dialog.component.scss'
})
export class EventDialogComponent {

  protected nameField = new FormControl<string | null>(null);
  protected dateField = new FormControl<Date>(new Date());
  protected watermarkField = new FormControl<File | false | null>(null);
  protected lockField = new FormControl<boolean>(false);

  protected readonly preview$: Observable<string | null>;

  constructor(
    protected dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) protected data: EventDialogProps,

    protected eventService: EventService,
  ) {
    const event = data.event;
    if (event) {
      this.nameField.reset(event.name);
      this.dateField.reset(new Date(event.timestamp));
      this.lockField.reset(event.locked);
    }

    this.preview$ = combineLatest([
      eventService.watermarkUrl.data$,
      this.watermarkField.valueChanges.pipe(startWith(null)),
    ]).pipe(
      map(([current, field]) => {
        if (field === false) return null;
        if (field === null) return current;

        const createBlob = readAndCompressImage(field, previewConfig)
          .then(preview => URL.createObjectURL(preview));
        return fromPromise(createBlob);
      }),
      switchMap(preview => isObservable(preview) ? preview : of(preview)),
      shareReplay(1),
    );
  }

  onUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    this.watermarkField.setValue(target.files[0]);
  }

  canSubmit(): boolean {
    const name = this.nameField.value;
    if (name === null) return false;
    if (name.length === 0) return false;

    const date = this.dateField.value;
    if (date === null) return false;

    return true;
  }

  submit() {
    if (!this.canSubmit()) return;

    const data: EventCreate | EventUpdate = {
      name: this.nameField.value as string,
      timestamp: JSON.stringify(this.dateField.value as Date).replaceAll("\"", ""),
      locked: this.lockField.value ?? false,
    };

    const action$ = this.data.event
      ? this.eventService.update(this.data.event.id, data)
      : this.eventService.create(data);

    action$.subscribe(result => this.dialogRef.close(result));
  }

}

export interface EventDialogProps {
  event?: PhotoEvent;
}
