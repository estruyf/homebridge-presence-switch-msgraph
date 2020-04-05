

export interface Logger {
  debug: (msg: any) => void;
  info: (msg: any) => void;
  warn: (msg: any) => void;
  error: (msg: any) => void;
}