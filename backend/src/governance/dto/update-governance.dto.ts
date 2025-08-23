import { PartialType } from '@nestjs/mapped-types';
import { CreateGovernanceDto } from './create-governance.dto';

export class UpdateGovernanceDto extends PartialType(CreateGovernanceDto) {}
