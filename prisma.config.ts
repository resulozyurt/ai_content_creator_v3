import { defineConfig } from '@prisma/config';
import 'dotenv/config'; // .env dosyasını sisteme yükler

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});