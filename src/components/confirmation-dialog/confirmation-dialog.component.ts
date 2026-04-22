import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  props = inject<ConfirmationDialogProps>(MAT_DIALOG_DATA);
}

export interface ConfirmationDialogProps {
  title: string;
  detail?: string;

  buttonClass?: string;
  buttonNames?: [string, string];
}
