import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users/users.service';
import { AppController } from './app.controller';
import { SessionGuard } from './auth/web/session.guard';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: SessionGuard, useValue: { canActivate: () => true } },
        { provide: UsersService, useValue: {} },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('raiz', () => {
    it('redireciona para /pedidos', () => {
      const redirect = jest.fn();
      appController.raiz({ redirect } as never);
      expect(redirect).toHaveBeenCalledWith('/pedidos');
    });
  });
});
