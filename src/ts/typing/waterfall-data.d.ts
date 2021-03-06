import TimeBlock from "../typing/time-block"

interface UserTiming {
  duration?: number
  name: string
  startTime: number
}

export interface Mark extends UserTiming {
  /** custom data to store x position */
  x?: number
}


export interface WaterfallData {
  title: string,
  durationMs: number,
  blocks: Array<TimeBlock>,
  marks: Array<Mark>,
  lines: Array<TimeBlock>
}

export interface WaterfallDocs {
  pages: Array<WaterfallData>
}
