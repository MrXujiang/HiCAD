export type ModelSource = 'ai' | 'manual' | 'template' | 'import';
export interface ModelMeta {
    id: string;
    userId: string;
    name: string;
    description: string;
    thumbnail: string;
    category: string;
    tags: string[];
    isPublic: boolean;
    shareToken: string;
    source?: ModelSource;
    templateId?: string;
    marketDescription?: string;
    likes?: number;
    views?: number;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ModelDetail extends ModelMeta {
    code: string;
}
export type TemplateTier = 'free' | 'pro';
export type TemplateCategory = string;
export interface TemplateParam {
    key?: string;
    name?: string;
    label?: string;
    type?: 'number' | 'boolean' | 'string';
    default: number | boolean | string;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
    unit?: string;
}
export interface Template {
    id: string;
    name: string;
    category: string;
    tier: TemplateTier;
    thumbnail: string;
    description: string;
    tags: string[];
    params: TemplateParam[];
    code: string;
    usageCount: number;
    createdAt?: string;
}
export interface TemplateListItem extends Omit<Template, 'code'> {
}
