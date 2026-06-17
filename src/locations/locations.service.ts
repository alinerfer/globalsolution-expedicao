import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverLocation } from './entities/driver-location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(DriverLocation)
    private readonly locationsRepository: Repository<DriverLocation>,
  ) {}

  registrar(
    driverId: number,
    latitude: number,
    longitude: number,
  ): Promise<DriverLocation> {
    const registro = this.locationsRepository.create({
      driverId,
      latitude,
      longitude,
    });
    return this.locationsRepository.save(registro);
  }

  ultimaPorDriver(driverId: number): Promise<DriverLocation | null> {
    return this.locationsRepository.findOne({
      where: { driverId },
      order: { recordedAt: 'DESC' },
    });
  }

  async ultimasDosDrivers(
    driverIds: number[],
  ): Promise<Map<number, DriverLocation>> {
    const mapa = new Map<number, DriverLocation>();
    for (const id of driverIds) {
      const ultima = await this.ultimaPorDriver(id);
      if (ultima) {
        mapa.set(id, ultima);
      }
    }
    return mapa;
  }
}
