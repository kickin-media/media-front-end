import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cookies-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './cookies-dialog.component.html',
  styleUrl: './cookies-dialog.component.scss',
})
export class CookiesDialogComponent {}
