import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { CreateGovernanceDto } from './dto/create-governance.dto';
import { UpdateGovernanceDto } from './dto/update-governance.dto';

@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Post()
  create(@Body() createGovernanceDto: CreateGovernanceDto) {
    return this.governanceService.create(createGovernanceDto);
  }

  @Get()
  findAll() {
    return this.governanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.governanceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGovernanceDto: UpdateGovernanceDto) {
    return this.governanceService.update(+id, updateGovernanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.governanceService.remove(+id);
  }
}
