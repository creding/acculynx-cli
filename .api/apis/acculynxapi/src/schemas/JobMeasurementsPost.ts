const JobMeasurementsPost = {
  "type": "object",
  "properties": {
    "measurementsFile": {
      "type": "string",
      "format": "binary",
      "description": "A file that represents the job measurement to be saved. An array of measurements is a valid structure",
      "examples": [
        " [ { \"roofLowSlopeArea\": 307.7, \"roofSteepSlopeArea\": 44.5, \"roofLowSlopePerimeter\": 432.3, \"dripEdge\": 152.7, \"eaves\": 672.8, \"flashing\": 139.9, \"stepFlashing\": 396.3, \"hips\": 41.9, \"parapets\": 232.9, \"rakes\": 805.6, \"ridges\": 38.3, \"valleys\": 12.5, \"roofPenetrationsArea\": 643.6, \"roofPenetrationsPerimeter\": 880.0, \"roofObstructions\": 645.7, \"roofObstructionsPerimeter\": 865.4, \"pitch\": 483, \"additionalPitches\": [ 301, 167 ], \"wallArea\": 235.7, \"windowAndDoorArea\": 112.7, \"windowAndDoorPerimeter\": 961.4, \"topOfWalls\": 782.3, \"bottomOfWalls\": 445.5, \"insideCorners\": 533.6, \"outsideCorners\": 304.5, \"insideObtuseCorners\": 662.6, \"outsideObtuseCorners\": 461.0, \"topOfSiding\": 706.4, \"bottomOfSiding\": 872.2, \"bottomOfMasonry\": 357.2, \"topOfMasonry\": 590.4, \"outsideMasonryCorners\": 531.0, \"insideMasonryCorners\": 310.0, \"pitchBreakdown\": [ { \"pitch\": 416, \"pitchValue\": 111.6 }, { \"pitch\": 24, \"pitchValue\": 33.6 } ] } ]"
      ]
    }
  },
  "required": [
    "measurementsFile"
  ],
  "title": "jobMeasurementsPost",
  "x-readme-ref-name": "jobMeasurementsPost",
  "$schema": "http://json-schema.org/draft-04/schema#"
} as const;
export default JobMeasurementsPost
