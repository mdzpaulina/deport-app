import { Op, Model } from 'sequelize';
import sequelize from './database/database'; // Asegúrate que la ruta a tu database.ts sea correcta

// --- Definición de Tipos para TypeScript ---

// Esta interfaz describe los atributos de un Contenedor
interface ContainerAttributes {
  id: string;
  location: string;
  status: 'CLEAN' | 'DAMAGED';
  entryDate: Date;
}

// Esta interfaz describe los atributos de un Movimiento
interface MovementAttributes {
  id?: number;
  containerId: string;
  moveType: 'IN' | 'OUT';
  timestamp?: Date;
}

// Extendemos el tipo Model con nuestros atributos para que Sequelize y TypeScript se entiendan
class Container extends Model<ContainerAttributes> implements ContainerAttributes {
  public id!: string;
  public location!: string;
  public status!: 'CLEAN' | 'DAMAGED';
  public entryDate!: Date;
}

class Movement extends Model<MovementAttributes> implements MovementAttributes {
  public id!: number;
  public containerId!: string;
  public moveType!: 'IN' | 'OUT';
  public readonly timestamp!: Date;
}

// Inicializamos los modelos que ya definiste, pero ahora con sus tipos
Container.init({} as any, { sequelize, modelName: 'Container' });
Movement.init({} as any, { sequelize, modelName: 'Movement' });


// --- Lógica de Negocio ---

/**
 * Obtiene las estadísticas principales para el Dashboard.
 */
export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalContainers = await Container.count();
  
  const entriesToday = await Movement.count({
    where: { moveType: 'IN', timestamp: { [Op.gte]: today } },
  });

  const exitsToday = await Movement.count({
    where: { moveType: 'OUT', timestamp: { [Op.gte]: today } },
  });

  return { totalContainers, entriesToday, exitsToday };
}

/**
 * Obtiene todos los contenedores activos en el patio.
 */
export async function getContainersInYard() {
  return await Container.findAll({
    order: [['entryDate', 'DESC']],
  });
}

/**
 * Crea un nuevo movimiento (Entrada o Salida) y actualiza el inventario.
 */
export async function createMovement(data: {
  containerId: string;
  location: string;
  moveType: 'IN' | 'OUT';
  status: 'CLEAN' | 'DAMAGED';
}) {
  if (data.moveType === 'IN') {
    const [container] = await Container.upsert({
      id: data.containerId,
      location: data.location,
      status: data.status,
      entryDate: new Date(),
    });
    
    await Movement.create({
      containerId: container.id, // Ahora TypeScript sabe que 'container.id' existe
      moveType: 'IN',
    });
    
  } else if (data.moveType === 'OUT') {
    const container = await Container.findByPk(data.containerId);
    if (container) {
      await container.destroy();
      
      await Movement.create({
        containerId: data.containerId,
        moveType: 'OUT',
      });
    } else {
      throw new Error('Container not found in yard');
    }
  }
  return { success: true, message: 'Movement registered successfully.' };
}