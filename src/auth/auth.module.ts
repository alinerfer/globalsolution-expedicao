import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SessionGuard } from './web/session.guard';
import { WebAuthController } from './web/web-auth.controller';

@Module({
  imports: [UsersModule],
  controllers: [WebAuthController],
  providers: [SessionGuard],
  exports: [SessionGuard],
})
export class AuthModule {}
