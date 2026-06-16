import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ApiLocationsController } from './api/api-locations.controller';
import { DriverLocation } from './entities/driver-location.entity';
import { LocationsService } from './locations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DriverLocation]),
    UsersModule,
    AuthModule,
  ],
  controllers: [ApiLocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
