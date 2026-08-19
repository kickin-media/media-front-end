import {patchState, signalStore, withComputed, withHooks, withMethods} from "@ngrx/signals";
import {AuthorService} from "../../../services/api/author.service";
import {computed, inject} from "@angular/core";
import {toSignal} from "@angular/core/rxjs-interop";
import {removeEntity, updateEntity, upsertEntities, withEntities} from "@ngrx/signals/entities";
import validateExif, {ExifWarning} from "../../../util/validate-exif";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {concatMap, from, pipe, tap} from "rxjs";
import {readAndCompressImage} from "browser-image-resizer";

const UPLOAD_LIMIT = 250;

const PREVIEW_CONFIG = {
  quality: 0.7,
  maxWidth: 400,
  maxHeight: 400,
};

interface Item {
  id: string;
  file: File;

  previewUrl?: string;
  warnings?: ExifWarning[];
}

export const PhotoUploadStore = signalStore(
  { providedIn: 'root' },
  withEntities<Item>(),
  withComputed((store, authorService = inject(AuthorService)) => ({
    author: toSignal(authorService.author.data$),
    files: computed(() => store.entities().map(item => item.file)),
    canUpload: computed(() => {
      const files = store.entities();

      // Ensure there are files to upload, but fewer than the upload limit
      if (files.length <= 0 || files.length > UPLOAD_LIMIT) return false;

      // All files should have been loaded (ie. have a preview url)
      const allLoaded = files.every(file => file.previewUrl !== undefined);
      if (!allLoaded) return false;

      // There shouldn't be any files with critical warnings
      const hasCriticalWarnings = files
        .filter(file => file.warnings !== undefined)
        .flatMap(file => file.warnings!)
        .some(warning => warning.critical);
      return !hasCriticalWarnings;
    }),
  })),

  withMethods((store) => {
    const processFiles = rxMethod<File[]>(
      pipe(
        concatMap((files) => from(files)),
        concatMap(async (file) => {
          const blob = await readAndCompressImage(file, PREVIEW_CONFIG);
          const previewUrl = URL.createObjectURL(blob);
          const warnings = await validateExif(file);

          return { id: file.name, previewUrl, warnings };
        }),
        tap(({ id, previewUrl, warnings }) => {
          patchState(store, updateEntity({ id, changes: { previewUrl, warnings } }));
        }),
      )
    );

    return {
      addFiles(files: File[]) {
        patchState(
          store,
          upsertEntities(files.map(file => ({ id: file.name, file }) as Item))
        );
        processFiles(files);
      },

      removeFile(fileId: string) {
        const item = store.entityMap()[fileId];
        if (item?.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
        patchState(store, removeEntity(fileId));
      },
    };
  }),

  withHooks({
    onDestroy(store) {
      store.entities().forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    },
  }),
);
