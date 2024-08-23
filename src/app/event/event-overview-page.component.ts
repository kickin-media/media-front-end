import { Component } from '@angular/core';
import { EventService } from "../../services/api/event.service";
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollableWindow,
  CdkVirtualScrollViewport
} from "@angular/cdk/scrolling";
import { EventComponent } from "./components/event/event.component";
import { AsyncPipe, NgIf } from "@angular/common";
import { TitleSectionComponent } from "../../components/title-section/title-section.component";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { EventOverviewDataSource } from "./lib/event-overview.datasource";
import { MatDialog } from "@angular/material/dialog";
import { EventDialogComponent } from "./components/event-dialog/event-dialog.component";
import { Router } from "@angular/router";
import { PhotoEvent } from "../../util/types";
import slugify from "slugify";
import { AccountService } from "../../services/account.service";

@Component({
  selector: 'event-overview-page',
  standalone: true,
  imports: [
    AsyncPipe,

    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollableWindow,
    CdkVirtualScrollViewport,
    MatButtonModule,
    MatIconModule,

    EventComponent,
    TitleSectionComponent,
    NgIf,
  ],
  templateUrl: './event-overview-page.component.html',
  styleUrl: './event-overview-page.component.scss'
})
export class EventOverviewPageComponent {

  protected dataSource: EventOverviewDataSource;

  constructor(
    protected dialog: MatDialog,
    protected router: Router,
    protected accountService: AccountService,
    protected eventService: EventService,
  ) {
    this.dataSource = new EventOverviewDataSource(eventService);
  }

  createEvent() {
    const dialogRef = this.dialog.open(EventDialogComponent, { data: {} });
    dialogRef.afterClosed().subscribe((result: PhotoEvent | null) => {
      if (!result) return;
      this.router.navigate([`/event/${result.id}/${slugify(result.name)}`]);
    });
  }

}
