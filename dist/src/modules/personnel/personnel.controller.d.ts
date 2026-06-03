import { PersonnelService } from "./personnel.service";
import { AuthUser } from "../auth/auth.service";
import { PersonnelFilterDto, UpdateRoleDto, UpdateStatusDto } from "./dto/personnel.dto";
export declare class PersonnelController {
    private readonly personnelService;
    constructor(personnelService: PersonnelService);
    findAll(user: AuthUser, filters: PersonnelFilterDto): Promise<{
        data: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            name: string;
            status: import(".prisma/client").$Enums.AccountStatus;
            createdAt: Date;
        }[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    findOne(id: string, user: AuthUser): Promise<{
        id: string;
        email: string;
        mfaEnabled: boolean;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRole(id: string, dto: UpdateRoleDto, user: AuthUser): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
    }>;
    updateStatus(id: string, dto: UpdateStatusDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        name: string;
        status: import(".prisma/client").$Enums.AccountStatus;
    }>;
}
