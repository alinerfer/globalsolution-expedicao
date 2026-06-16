import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { ApiAuthController } from './api/api-auth.controller';
import { JwtAuthGuard } from './api/jwt-auth.guard';
import { SessionGuard } from './web/session.guard';
import { WebAuthController } from './web/web-auth.controller';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'segredo',
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [WebAuthController, ApiAuthController],
  providers: [SessionGuard, JwtAuthGuard],
  exports: [SessionGuard, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
