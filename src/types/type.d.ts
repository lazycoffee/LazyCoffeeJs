export type JSONType =
    | string
    | number
    | boolean
    | null
    | JSONType[]
    | { [key: string]: JSONType };

export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };
