import { Controller, Get } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { Roles } from "../auth/roles.decorator";
import { Role } from "../common/roles.enum";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit-log')
export class AuditController {
    constructor(private auditService: AuditService) {}

    @Get()
    @Roles(Role.OWNER, Role.ADMIN)
    getLogs() {
        return this.auditService.findAll();
    }
}