export declare class SettingFilterDto {
    category?: string;
}
export declare class CreateSettingDto {
    key: string;
    value: string;
    category?: string;
    isPublic?: boolean;
}
export declare class UpdateSettingDto {
    value: string;
    userId?: string;
    category?: string;
    isPublic?: boolean;
}
