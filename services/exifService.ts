import piexif from "piexifjs";

/**
 * Injects professional studio camera metadata (Canon EOS R5) into a base64 image.
 * Primarily designed for JPEG, will convert if necessary.
 */
export const injectProfessionalMetadata = async (base64Image: string): Promise<string> => {
  try {
    // Ensure we have a JPEG for EXIF injection. 
    // If it's a PNG, we'll draw it to a canvas and export as JPEG.
    let jpegBase64 = base64Image;
    if (base64Image.startsWith("data:image/png")) {
        jpegBase64 = await convertToJpeg(base64Image);
    }

    const zeroth: any = {};
    const exif: any = {};
    const gps: any = {};

    const now = new Date();
    const dateStr = now.getFullYear() + ":" + 
                    ("0" + (now.getMonth() + 1)).slice(-2) + ":" + 
                    ("0" + now.getDate()).slice(-2) + " " + 
                    ("0" + now.getHours()).slice(-2) + ":" + 
                    ("0" + now.getMinutes()).slice(-2) + ":" + 
                    ("0" + now.getSeconds()).slice(-2);

    // 0th (Image) Tags
    zeroth[piexif.ImageIFD.Make] = "Canon";
    zeroth[piexif.ImageIFD.Model] = "Canon EOS R5";
    zeroth[piexif.ImageIFD.Software] = "Adobe Photoshop 2024 (Macintosh)";
    zeroth[piexif.ImageIFD.DateTime] = dateStr;
    zeroth[piexif.ImageIFD.XResolution] = [600, 1];
    zeroth[piexif.ImageIFD.YResolution] = [600, 1];
    zeroth[piexif.ImageIFD.ResolutionUnit] = 2;

    // Exif Tags
    exif[piexif.ExifIFD.DateTimeOriginal] = dateStr;
    exif[piexif.ExifIFD.DateTimeDigitized] = dateStr;
    exif[piexif.ExifIFD.LensModel] = "RF85mm F1.2 L USM";
    exif[piexif.ExifIFD.LensMake] = "Canon";
    exif[piexif.ExifIFD.FNumber] = [18, 10]; // f/1.8
    exif[piexif.ExifIFD.ExposureTime] = [1, 125];
    exif[piexif.ExifIFD.ISOSpeedRatings] = 100;
    exif[piexif.ExifIFD.ExposureProgram] = 1; // Manual
    exif[piexif.ExifIFD.FocalLength] = [85, 1];
    exif[piexif.ExifIFD.ExifVersion] = "0231";
    exif[piexif.ExifIFD.ColorSpace] = 1; // sRGB

    const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
    const exifBytes = piexif.dump(exifObj);

    // Inject into the JPEG string
    const newBase64 = piexif.insert(exifBytes, jpegBase64);
    return newBase64;
  } catch (error) {
    console.error("Failed to inject EXIF metadata:", error);
    return base64Image; // Fail safe: return original
  }
};

/**
 * Helper to convert PNG to JPEG via Canvas
 */
const convertToJpeg = (pngBase64: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = pngBase64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context failed");
      
      // Fill with white background (in case of transparency)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = reject;
  });
};
