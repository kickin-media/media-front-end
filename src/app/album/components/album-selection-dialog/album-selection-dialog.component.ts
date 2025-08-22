import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { EventService } from "../../../../services/api/event.service";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { Album } from "../../../../util/types";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { AsyncPipe, NgForOf, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { TimestampPipe } from "../../../../pipes/timestamp.pipe";
import { combineLatest, map, Observable, shareReplay, startWith, tap } from "rxjs";
import { groupBy } from "../../../../util/groupby";
import { ConfigService } from "../../../../services/config.service";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'album-selection-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSelectModule,
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    MatButtonModule,
    TimestampPipe,
    NgIf,

  ],
  templateUrl: './album-selection-dialog.component.html',
  styleUrl: './album-selection-dialog.component.scss'
})
export class AlbumSelectionDialogComponent {

  protected albumField = new FormControl<Album | string | null>(null);

  // Yields albums indexed by date-strings or ""
  protected albums$: Observable<[string, Album[]][]>;

  constructor(
    protected configService: ConfigService,
    protected eventService: EventService,
  ) {
    this.getAlbumGroupIndices = this.getAlbumGroupIndices.bind(this);

    // Filter the albums
    const filteredAlbums$ = combineLatest([
      eventService.albums.data$,
      this.albumField.valueChanges.pipe(tap(console.log), startWith(null)),
    ]).pipe(
      map(([albums, filter]) => {
        if (!filter) return albums;
        if (typeof filter !== "string") return albums;
        return albums.filter(album => album.name.toLowerCase().includes(filter.toLowerCase()));
      }),
    );

    // Sort/group the albums
    this.albums$ = filteredAlbums$.pipe(
      map((albums: Album[]) => albums.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())),
      map((albums: Album[]) => groupBy(albums, configService.config.albums.groupIndex)),
      map(groups => {
        const albums = Object.values(groups).flatMap(albums => albums);
        const albumsPerGroup = albums.length / Object.keys(groups).length;


        if (albums.length > 10 && albumsPerGroup > 4) return groups;
        else return ({ [""]: albums });
      }),
      map(this.getAlbumGroupIndices),
      shareReplay(1),
    );
  }

  protected renderAlbum(album: Album): string {
    return album.name;
  }

  protected getAlbumGroupIndices(groups: { [key: string]: Album[] }): [string, Album[]][] {
    return Object.keys(groups)
      .sort(this.configService.config.albums.groupSort)
      .map(key => [key, groups[key]]);
  }

  protected displayFn(album?: Album): string {
    if (!album) return "";
    return album.name
  }

  protected canSubmit(): boolean {
    const album = this.albumField.value;

    if (album === null) return false;
    return typeof album !== "string";
  }

}
