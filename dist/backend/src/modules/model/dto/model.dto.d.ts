export declare class CreateModelDto {
    name: string;
    description?: string;
    code: string;
    thumbnail?: string;
    category?: string;
    tags?: string[];
    source?: string;
}
export declare class UpdateModelDto {
    name?: string;
    description?: string;
    code?: string;
    thumbnail?: string;
    category?: string;
    tags?: string[];
}
export declare class PublishModelDto {
    name?: string;
    marketDescription?: string;
    category?: string;
    tags?: string[];
    thumbnail?: string;
}
