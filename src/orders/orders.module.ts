import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { ApiOrdersController } from './api/api-orders.controller';
import { OrdersService } from './orders.service';
import { OrdersController } from './web/orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    UsersModule,
    AuthModule,
  ],
  controllers: [OrdersController, ApiOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
