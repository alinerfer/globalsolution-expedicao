import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LocationsModule } from '../locations/locations.module';
import { UsersModule } from '../users/users.module';
import { DriversController } from './drivers.controller';

@Module({
  imports: [UsersModule, AuthModule, LocationsModule],
  controllers: [DriversController],
})
export class DriversModule {}
