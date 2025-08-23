import { Injectable } from '@nestjs/common';
import { CreateGovernanceDto } from './dto/create-governance.dto';
import { UpdateGovernanceDto } from './dto/update-governance.dto';

@Injectable()
export class GovernanceService {
  create(createGovernanceDto: CreateGovernanceDto) {
    return 'This action adds a new governance';
  }

  findAll() {
    return `This action returns all governance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} governance`;
  }

  update(id: number, updateGovernanceDto: UpdateGovernanceDto) {
    return `This action updates a #${id} governance`;
  }

  remove(id: number) {
    return `This action removes a #${id} governance`;
  }
}
