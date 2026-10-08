import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HelpAdminListDto, HelpArticleDto, HelpFeedbackDto, HelpIdDto, HelpListDto, HelpSlugDto, HelpUpdateDto, LocaleDto } from './dto';
import { HelpService } from './help.service';

@Controller()
export class HelpController {
    constructor(private readonly help: HelpService) {}

    @MessagePattern('help.categories')
    categories(@Payload() dto: LocaleDto) {
        return this.help.categories(dto);
    }

    @MessagePattern('help.list')
    list(@Payload() dto: HelpListDto) {
        return this.help.list(dto);
    }

    @MessagePattern('help.get')
    get(@Payload() dto: HelpSlugDto) {
        return this.help.getBySlug(dto);
    }

    @MessagePattern('help.feedback')
    feedback(@Payload() dto: HelpFeedbackDto) {
        return this.help.feedback(dto.id, dto.reaction as 'yes' | 'maybe' | 'no');
    }

    @MessagePattern('help.adminList')
    adminList(@Payload() dto: HelpAdminListDto) {
        return this.help.adminList(dto);
    }

    @MessagePattern('help.adminGet')
    adminGet(@Payload() dto: HelpIdDto) {
        return this.help.adminGet(dto.id);
    }

    @MessagePattern('help.create')
    create(@Payload() dto: HelpArticleDto) {
        return this.help.create(dto);
    }

    @MessagePattern('help.update')
    update(@Payload() dto: HelpUpdateDto) {
        return this.help.update(dto);
    }

    @MessagePattern('help.delete')
    remove(@Payload() dto: HelpIdDto) {
        return this.help.remove(dto.id);
    }
}
