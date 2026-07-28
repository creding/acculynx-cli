const JobPhotoVideoFormPost = {
  "type": "object",
  "properties": {
    "file": {
      "type": "string",
      "format": "binary",
      "description": "File to be Uploaded to the Job.\n\nThe file types allowed are images or videos:\n- For Images the following extensions are allowed:\n  .cmx, .cod, .dib, .gif, .heic, .heif, .ico, .ief, .jfif,.jpe, .jpeg, .jpg, .mac, .pbm, \n  .pct, .pgm, .pic, .pict,.png, .pnm, .pnt, .pntg, .pnz, .ppm, .qti, .qtif, .ras, .rf, .rgb, .tif, .tiff, .wbmp, .wdp, .xbm, .xpm, .xwd.\n- For Videos the following extensions are allowed: \n  .3g2, .3gp, .3gp2, .3gpp, .asf, .asr, .asx, .avi, .dif, .dv, .flv, .IVF, .lsf, .lsx, \n  .m1v, .m2t, .m2ts, .m2v, .m4v, .mod, .mov, .movie, .mp2, .mp2v, .mp4, .mp4v, .mpa, .mpe, .mpeg, .mpg, .mpv2, .mqv, .mts, .nsc, .qt, .ts, \n  .tts, .vbk, .wm, .wmp, .wmv, .wmx.\n"
    },
    "description": {
      "type": "string",
      "description": "A brief description related to the file that is being uploaded."
    },
    "tags": {
      "type": "string",
      "description": "A comma-separated list of 'GUID' to be applier to the photo or video. The tags should exist within the location.",
      "examples": [
        "a4cce567-43a9-434b-a146-256f1ad71ea5, d4cce567-43a9-434b-a146-256f1ad71ea7"
      ]
    },
    "fileUri": {
      "description": "The URI of the file to upload. This image will be uploaded if the 'File' field is not selected.",
      "type": "string",
      "format": "uri",
      "examples": [
        "https://www.pngall.com/wp-content/uploads/13/Blue-Emoji-PNG-Clipart.png"
      ]
    },
    "externalId": {
      "type": "string",
      "description": "A field to link the file with a job external reference identifier"
    },
    "externalSource": {
      "type": "string",
      "description": "A field to link the file with a job external reference source"
    }
  },
  "title": "jobPhotoVideoFormPost",
  "x-readme-ref-name": "jobPhotoVideoFormPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobPhotoVideoFormPost
