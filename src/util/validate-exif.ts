// @ts-ignore
import ExifParser from "exif-parser";

type ExifTagsType = {
  [key: string]: any;
};

const validateExif: (file: File) => Promise<ExifWarning[]> = (file) => readExif(file).then(tags => {
  // If no tags are available at all, then do an early return...
  if (!tags) {
    return [{ type: ExifWarningType.NoExifData, critical: true }];
  }

  const warnings: ExifWarning[] = [];

  // Test if the exif data includes an aperture
  if (!tags["ApertureValue"]) {
    warnings.push({ type: ExifWarningType.NoAperture, critical: false });
  }

  // Test for color space
  if (tags["ColorSpace"] === undefined) {
    warnings.push({ type: ExifWarningType.NoColorSpace, critical: false });
  } else if (tags["ColorSpace"] !== 1) {
    warnings.push({ type: ExifWarningType.InvalidColorSpace, critical: true });
  }

  // Test whether the `DateTimeOriginal` attribute is set
  if (!tags["DateTimeOriginal"]) {
    warnings.push({ type: ExifWarningType.NoDateTimeStamp, critical: false });
  }

  // Test if the exif data includes a focal length
  if (!tags["FocalLength"]) {
    warnings.push({ type: ExifWarningType.NoFocalLength, critical: false });
  }

  // Test if the exif data includes an ISO value
  if (!tags["ISO"]) {
    warnings.push({ type: ExifWarningType.NoISO, critical: false });
  }

  // Test if the exif data includes a shutter speed (or exposure time)
  if (!tags["ExposureTime"] && !tags["ShutterSpeedValue"]) {
    warnings.push({ type: ExifWarningType.NoShutterSpeed, critical: false });
  }

  return warnings;
});

const readExif: (file: File) => Promise<ExifTagsType | null> = (
  file
) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    if (!reader.result) {
      reject(new Error("Could not read file..."));
      return;
    }

    const res = ExifParser.create(reader.result).parse();
    if (!res || !res.tags) {
      resolve(null)
      return;
    }

    resolve(res.tags);
  }

  reader.readAsArrayBuffer(file);
});

export interface ExifWarning {
  type: ExifWarningType;
  critical: boolean;
}

export const enum ExifWarningType {
  NoExifData= "NoExifData",

  NoAperture = "NoAperture",
  NoColorSpace = "NoColorSpace",
  NoDateTimeStamp = "NoDateTimeStamp",
  NoFocalLength = "NoFocalLength",
  NoISO = "NoISO",
  NoShutterSpeed = "NoShutterSpeed",

  InvalidColorSpace = "InvalidColorSpace",
}

export const EXIF_WARNING_MESSAGES: Record<ExifWarningType, string> = {
  [ExifWarningType.NoExifData]: "Could not read the exif data of this photo.",

  [ExifWarningType.NoAperture]: "The photo's aperture could not be detected.",
  [ExifWarningType.NoColorSpace]: "The photo's color space could not be detected.",
  [ExifWarningType.NoDateTimeStamp]: "The photo's original timestamp could not be found.",
  [ExifWarningType.NoFocalLength]: "The photo's focal length could not be detected.",
  [ExifWarningType.NoShutterSpeed]: "The photo's shutter speed could not be detected.",
  [ExifWarningType.NoISO]: "The photo's ISO could not be detected.",

  [ExifWarningType.InvalidColorSpace]: "The photo's color space is not sRGB.",
};

export default validateExif;
