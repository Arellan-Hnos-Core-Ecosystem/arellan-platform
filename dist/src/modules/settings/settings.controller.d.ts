import { SettingsService } from "./settings.service";
import { CreateSettingDto, UpdateSettingDto } from "./dto/settings.dto";
import { AuthUser } from "../auth/auth.service";
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getAll(): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }[]>;
    getByCategory(category: string): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }[]>;
    get(key: string): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }>;
    create(dto: CreateSettingDto, user: AuthUser): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }>;
    update(key: string, dto: UpdateSettingDto, user: AuthUser): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }>;
    set(key: string, dto: UpdateSettingDto, user: AuthUser): Promise<{
        id: string;
        updatedAt: Date;
        category: string;
        updatedBy: string | null;
        key: string;
        value: string;
        isPublic: boolean;
    }>;
    delete(key: string): Promise<{
        message: string;
    }>;
}
