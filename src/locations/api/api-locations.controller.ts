import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/api/jwt-auth.guard';
import { User } from '../../users/entities/user.entity';
import { LocationsService } from '../locations.service';

@Controller('api/locations')
@UseGuards(JwtAuthGuard)
export class ApiLocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  async registrar(
    @Body() body: { latitude?: number; longitude?: number },
    @Req() req: Request,
  ) {
    const usuario = (req as Request & { usuario: User }).usuario;
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new BadRequestException('Coordenadas inválidas.');
    }

    const registro = await this.locationsService.registrar(
      usuario.id,
      latitude,
      longitude,
    );
    return {
      id: registro.id,
      latitude: registro.latitude,
      longitude: registro.longitude,
      recordedAt: registro.recordedAt,
    };
  }
}
