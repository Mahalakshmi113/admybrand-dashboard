// global.d.ts
declare module "papaparse" {
  interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: any;
  }

  interface ParseConfig<T> {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean;
    step?: (results: ParseResult<T>, parser: any) => void;
    complete?: (results: ParseResult<T>) => void;
    error?: (error: any) => void;
    download?: boolean;
  }

  const Papa: {
    parse<T = any>(input: string | File, config?: ParseConfig<T>): void;
    unparse(data: any, config?: any): string;
  };

  export default Papa;
}

declare module "jspdf";
declare module "jspdf-autotable";

