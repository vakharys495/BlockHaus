import { Test, TestingModule } from '@nestjs/testing';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';

describe('GovernanceController', () => {
  let controller: GovernanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GovernanceController],
      providers: [GovernanceService],
    }).compile();

    controller = module.get<GovernanceController>(GovernanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
