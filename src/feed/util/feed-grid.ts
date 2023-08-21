import React, { useEffect, useMemo, useReducer } from "react";
import { PhotoType } from "../../redux/reducers/photo";

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
  const queueSize = useMemo(() => feed.queue.length, [feed.queue]);

  return [gridList, feed.currentPhotos, queueSize, addToQueue];
};

const feedReducer: React.Reducer<FeedType, FeedActionType> = (state, action) => {
  state = Object.assign({}, state);
  switch (action.type) {
    case "add-queue":
      // Skip if this photo is already on the grid
      if (state.currentPhotos[action.photo.id]) break;

      // Skip if this photo is already in the queue
      if (state.queue.indexOf(action.photo) >= 0) break;

      // Otherwise, add the photo to the queue
      state.queue = [...state.queue, action.photo];

      // Cache the photo in the playground
      const image = document.createElement("img");
      image.src = action.photo.imgUrls.large;
      image.id = `feed-${action.photo.id}`;
      document.getElementById("feed-playground")?.appendChild(image);
      break;
    case "update":
      // Check if we have empty cells
      let empties = state.grid
        .map((cell, index) => cell === "empty" ? index : null)
        .filter(idx => idx !== null);

      // Fill those first
      if (empties.length > 0) {
        // Select a random cell to fill
        let idx = empties[Math.floor(Math.random() * empties.length)];
        if (idx === null) break;

        // Get a photo from the front of the queue
        let photo = state.queue.shift();
        if (!photo) break;

        // Get and remove image from playground
        let image = document.getElementById(`feed-${photo.id}`);
        if (!image) break;
        image.remove();

        state.grid[idx] = photo.id;
        state.currentPhotos[photo.id] = { photo, x: Math.floor(idx / state.cols), y: idx % state.cols, width: 1, height: 1 };
      } else {
        // Otherwise just insert somewhere
        let photo = state.queue.shift();
        if (!photo) break;

        // Get and remove image from playground
        let image = document.getElementById(`feed-${photo.id}`) as HTMLImageElement | null;
        if (!image) break;
        let ratio = image.width / image.height;
        image.remove();

        let w = 1;
        let h = 1;

        if (ratio < 1 && Math.random() > 0.6) h = 2;
        if (ratio > 1.5 && Math.random() > 0.6) {
          w = 2;
          h = 2;
        }

        let x = Math.floor(Math.random() * (state.cols - w + 1));
        let y = Math.floor(Math.random() * (state.rows - h + 1));

        state.currentPhotos[photo.id] = {
          photo,
          x, y,
          width: w, height: h
        };

        for (let xx = x; xx < x + w; xx++) for (let yy = y; yy < y + h; yy++) {
          let current = state.grid[yy * state.cols + xx];
          if (current !== "empty" && current.startsWith("filled-")) {
            let curImg = state.currentPhotos[current.substring(7)];
            for (let i = curImg.x; i < curImg.x + curImg.width; i++)
              for (let j = curImg.y; j < curImg.y + curImg.height; j++)
                state.grid[j * state.cols + i] = 'empty';
          } else if (current !== "empty") state.grid[yy * state.cols + xx] = 'empty';

          state.grid[yy * state.cols + xx] = `filled-${photo.id}`;
        }

        state.grid[y * state.cols + x] = photo.id;
      }
      break;
    case "start":
      if (state.cron) break;
      state.cron = setInterval(action.iter, 5000);

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
