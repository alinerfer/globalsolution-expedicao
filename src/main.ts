import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Liquid } from 'liquidjs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const viewsPath = join(__dirname, '..', 'views');
  const engine = new Liquid({
    root: viewsPath,
    extname: '.liquid',
    cache: process.env.NODE_ENV === 'production',
  });

  app.engine('liquid', engine.express());
  app.setViewEngine('liquid');
  app.setBaseViewsDir(viewsPath);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
