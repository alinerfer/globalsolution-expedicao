import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { WebAuthController } from './web/web-auth.controller';

@Module({
  imports: [UsersModule],
  controllers: [WebAuthController],
})
export class AuthModule {}
