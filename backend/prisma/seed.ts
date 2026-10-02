import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const usersPath = path.join(__dirname, '..', 'data', 'users.json');
  const alertsPath = path.join(__dirname, '..', 'data', 'alerts.json');

  if (fs.existsSync(usersPath)) {
    const rawUsers = fs.readFileSync(usersPath, 'utf-8');
    const users = JSON.parse(rawUsers);

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          createdAt: new Date(user.createdAt),
        },
      });
    }
    console.log(`✅ ${users.length} usuários sincronizados.`);
  }

  if (fs.existsSync(alertsPath)) {
    const rawAlerts = fs.readFileSync(alertsPath, 'utf-8');
    const alerts = JSON.parse(rawAlerts);

    for (const alert of alerts) {
      const userExists = await prisma.user.findUnique({ where: { id: alert.userId } });
      if (!userExists) continue;

      await prisma.alert.upsert({
        where: { id: alert.id },
        update: {},
        create: {
          id: alert.id,
          title: alert.title,
          type: alert.type,
          description: alert.description,
          location: alert.location,
          radiusKm: alert.radiusKm,
          severity: alert.severity || 'MEDIA',
          mapX: alert.mapX,
          mapY: alert.mapY,
          userId: alert.userId,
          createdAt: new Date(alert.createdAt),
        },
      });
    }
    console.log(`✅ ${alerts.length} alertas sincronizados.`);
  }
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
