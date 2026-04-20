import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-basic-auth-dialog',
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule],
  templateUrl: './basic-auth-dialog.component.html',
  styleUrl: './basic-auth-dialog.component.scss',
})
export class BasicAuthDialogComponent {
  protected passwordField = new FormControl<string>('');
  protected hidePassword = true;

  constructor(
    protected dialogRef: MatDialogRef<BasicAuthDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BasicAuthDialogProps
  ) {}

  submit(): void {
    const password = this.passwordField.value;
    if (password) {
      this.dialogRef.close(password);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}

export interface BasicAuthDialogProps {
  hint: string;
}
