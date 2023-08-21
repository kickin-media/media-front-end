import React, { useEffect, useMemo, useReducer } from "react";
import { PhotoType } from "../../redux/reducers/photo";
import { shuffleArray } from "../../util/shuffle";

export const useFeed = (rows: number, cols: number, run: boolean = true) => {
  const [feed, dispatch] = useReducer<React.Reducer<FeedType, FeedActionType>>(feedReducer, {
    grid: new Array(rows * cols).fill("empty"),
    currentPhotos: {},
    queue: [],
    rows, cols,
    cron: null
  });

  // Create a playground
  useEffect(() => {
    const playground = document.createElement("div");
    playground.id = "feed-playground";
    playground.style.display = "none";
    document.body.appendChild(playground);
    return () => {document.body.removeChild(playground)};
  }, []);

  // Actions
  const addToQueue = (photo: PhotoType) => dispatch({ type: "add-queue", photo: photo });
  const update = () => dispatch({ type: "update" });

  useEffect(() => {
    if (!run) dispatch({ type: "stop" });
    else dispatch({ type: "start", iter: update });

    return () => dispatch({ type: "stop" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vars
  const gridList = feed.grid
    .filter(cell => !cell.startsWith("filled-"))
    .map(cell => cell === "empty" ? null : cell);
  const queueSize = useMemo(() => feed.queue.length, [feed]);

  return [gridList, feed.currentPhotos, queueSize, addToQueue];
};

const feedReducer: React.Reducer<FeedType, FeedActionType> = (state, action) => {
  state = Object.assign({}, state);
  switch (action.type) {
    case "add-queue":
      // Skip if this photo is already on the grid
      if (state.currentPhotos[action.photo.id]) break;

      // Skip if this photo is already in the queue
      if (state.queue.map(photo => photo.id).indexOf(action.photo.id) >= 0) break;

      // Otherwise, add the photo to the queue
      state.queue = [...state.queue, action.photo];

      // Cache the photo in the playground
      const img = document.createElement("img");
      img.src = action.photo.imgUrls.large;
      img.id = `feed-${action.photo.id}`;
      document.getElementById("feed-playground")?.appendChild(img);
      break;
    case "update":
      // Get a photo from the front of the queue
      let photo = state.queue.shift();
      if (!photo) break;

      if (state.currentPhotos[photo.id]) {
        console.warn("Came across a photo that was already in rotation: " + photo.id)
        break;
      }

      // Get and remove image from playground
      let image = document.getElementById(`feed-${photo.id}`) as HTMLImageElement | null;
      if (!image) break;
      const ratio = image.width / image.height;
      image.remove();

      let x, y, w, h;
      const cellRatio = (window.innerWidth / state.cols) / (window.innerHeight / state.rows);
      let relativeRatio = ratio / cellRatio;

      // Check if we have empty cells
      const empties = state.grid
        .map((cell, index) => cell === "empty" ? index : null)
        .filter(idx => idx !== null) as number[];
      shuffleArray(empties);

      const selectSize = (x: number, y: number) => {
        let w = 1;
        let h = 1;

        if (relativeRatio >= 1.5 && x + 1 < state.cols) w = 2;
        if (relativeRatio <= 0.75 && y + 1 < state.rows) h = 2;
        if (x + 1 < state.cols && y + 1 < state.rows && Math.random() >= 0.7) {
          w = 2;
          h = 2;
        }

        return {w, h};
      }

      if (empties.length > 0) {
        let success = false;
        for (let i = 0; i < Math.min(5, empties.length); i++) {
          let idx = empties[i];
          x = idx % state.cols;
          y = Math.floor(idx / state.cols);

          let size = selectSize(x, y);
          w = size.w;
          h = size.h;

          if (w === 1 && h === 2) {
            let target = state.grid[idx+state.cols];
            if (target === "empty" || (state.currentPhotos[target] && state.currentPhotos[target].width === 1 && state.currentPhotos[target].height === 1)) {
              success = true;
              break;
            }
          } else if (w === 2 && h === 1) {
            let target = state.grid[idx+1];
            if (target === "empty" || (state.currentPhotos[target] && state.currentPhotos[target].width === 1 && state.currentPhotos[target].height === 1)) {
              success = true;
              break;
            }
          } else if (w === 2 && h === 2) {
            let fail = false;
            for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) {
              let target = state.grid[j * state.cols + i];
              if (target === "empty") continue;
              if (!state.currentPhotos[target] || state.currentPhotos[target].width > 1 || state.currentPhotos[target].height > 1) {
                fail = true;
                break;
              }
            }
            if (!fail) {
              success = true;
              break;
            }
          }
        }

        if (!success) {
          w = 1;
          h = 1;
        }
      } else {
        x = Math.floor(Math.random() * state.cols);
        y = Math.floor(Math.random() * state.rows);
        let size = selectSize(x, y);
        w = size.w;
        h = size.h;
      }

      for (let xx = x; xx < x + w; xx++) for (let yy = y; yy < y + h; yy++) {
        let current = state.grid[yy * state.cols + xx];
        if (current !== "empty") {
          let curImgId = current.startsWith("filled-") ? current.substring(7) : current;
          let curImg = state.currentPhotos[curImgId];
          for (let i = curImg.x; i < curImg.x + curImg.width; i++)
            for (let j = curImg.y; j < curImg.y + curImg.height; j++)
              state.grid[j * state.cols + i] = 'empty';

          delete state.currentPhotos[curImgId];
        }

        state.grid[yy * state.cols + xx] = `filled-${photo.id}`;
      }

      state.grid[y * state.cols + x] = photo.id;
      state.currentPhotos[photo.id] = { photo, x, y, width: w, height: h };
      break;
    case "start":
      if (state.cron) break;
      state.cron = setInterval(action.iter, 500);

      break;
    case "stop":
      if (!state.cron) break;
      clearInterval(state.cron);
      state.cron = null;
      break;
  }
  return state;
}

interface FeedType {
  grid: (string | "empty")[];

  currentPhotos: { [key: string]: FeedPhotoType };
  queue: PhotoType[];

  rows: number;
  cols: number;

  cron: NodeJS.Timeout | null;
}

interface FeedPhotoType {
  x: number;
  y: number;
  width: number;
  height: number;
  photo: PhotoType;
}

type FeedActionType = AddToQueueAction | UpdateAction | StartAction | StopAction;

interface BaseAction {
  type: string;
}

interface AddToQueueAction extends BaseAction {
  type: "add-queue";
  photo: PhotoType;
}

interface UpdateAction extends BaseAction {
  type: "update";
}

interface StartAction extends BaseAction {
  type: "start";
  iter: () => void;
}

interface StopAction extends BaseAction {
  type: "stop";
}
