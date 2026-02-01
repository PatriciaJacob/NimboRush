import { Entity, EntityType } from './entity';
import { S3Bucket } from './s3Bucket';
import { Player } from './player';

export class CollisionManager {
  private entities: Map<EntityType, Entity[]> = new Map();

  constructor() {
    // Initialize entity type arrays
    for (const type of Object.values(EntityType)) {
      this.entities.set(type as EntityType, []);
    }
  }

  // Register entities with the collision manager
  registerEntity(entity: Entity): void {
    const type = entity.getEntityType();
    const entities = this.entities.get(type) || [];
    if (!entities.includes(entity)) {
      entities.push(entity);
      this.entities.set(type, entities);
    }
  }

  unregisterEntity(entity: Entity): void {
    const type = entity.getEntityType();
    const entities = this.entities.get(type) || [];
    const index = entities.indexOf(entity);
    if (index !== -1) {
      entities.splice(index, 1);
    }
  }

  clearAll(): void {
    for (const type of Object.values(EntityType)) {
      this.entities.set(type as EntityType, []);
    }
  }

  // Get all entities at a specific position
  getEntitiesAt(x: number, y: number): Entity[] {
    const result: Entity[] = [];
    for (const entities of this.entities.values()) {
      for (const entity of entities) {
        if (entity.getGridX() === x && entity.getGridY() === y) {
          result.push(entity);
        }
      }
    }
    return result;
  }

  // Get entities of a specific type at a position
  getEntityAt<T extends Entity>(x: number, y: number, type: EntityType): T | undefined {
    const entities = this.entities.get(type) || [];
    return entities.find(e => e.getGridX() === x && e.getGridY() === y) as T | undefined;
  }

  // Get all entities of a specific type
  getEntitiesByType<T extends Entity>(type: EntityType): T[] {
    return (this.entities.get(type) || []) as T[];
  }

  // Check if player can move to a position
  canPlayerMoveTo(
    player: Player,
    x: number,
    y: number
  ): {
    canMove: boolean;
    needsPush?: Entity;
    reason?: string;
  } {
    const entitiesAtTarget = this.getEntitiesAt(x, y);

    // Check each entity at the target position
    for (const entity of entitiesAtTarget) {
      const type = entity.getEntityType();

      // Walls always block player movement
      if (type === EntityType.WALL) {
        return { canMove: false, reason: 'wall' };
      }

      // S3 Buckets: special handling for push or file deposit
      if (type === EntityType.S3_BUCKET) {
        const bucket = entity as S3Bucket;

        // If player has files and bucket isn't full, allow entering to deposit file
        if (player.getFilesCollected() > 0 && !bucket.isFull()) {
          // This will be handled by onPlayerEnter callback
          return { canMove: false, needsPush: bucket, reason: 'deposit_file' };
        }

        // Check if bucket can be pushed
        if (bucket.canBePushed && bucket.canBePushed()) {
          return { canMove: false, needsPush: bucket, reason: 'push_bucket' };
        }

        // Bucket exists but can't be pushed or deposited into
        return { canMove: false, reason: 'unpushable_bucket' };
      }

      // For other entities:
      // - If they have onPlayerEnter, they allow player movement (will be triggered in game.ts)
      // - If they don't have onPlayerEnter but don't block movement, they allow player (like holes, goals)
      // - If they don't have onPlayerEnter AND block movement, they block player (handled above for walls)
      if (!entity.onPlayerEnter && entity.blocksMovement()) {
        return { canMove: false, reason: `blocked_by_${type}` };
      }
    }

    // No blocking entities found
    return { canMove: true };
  }

  // Check if an entity can be pushed to a position
  canPushEntityTo(entity: Entity, x: number, y: number): boolean {
    const entitiesAtTarget = this.getEntitiesAt(x, y);

    for (const target of entitiesAtTarget) {
      // Walls block pushes
      if (target.getEntityType() === EntityType.WALL) {
        return false;
      }

      // Other S3 buckets block pushes
      if (target.getEntityType() === EntityType.S3_BUCKET) {
        return false;
      }

      // Any entity that blocks movement also blocks pushes
      if (target.blocksMovement()) {
        return false;
      }
    }

    return true;
  }

  // Trigger player enter callbacks for all entities at position
  triggerPlayerEnter(player: Player, x: number, y: number): void {
    const entitiesAtTarget = this.getEntitiesAt(x, y);

    for (const entity of entitiesAtTarget) {
      if (entity.onPlayerEnter) {
        entity.onPlayerEnter();
      }
    }
  }

  // Check if position has a hole (for fall detection)
  hasHole(x: number, y: number): boolean {
    return this.getEntityAt(x, y, EntityType.HOLE) !== undefined;
  }

  // Check if position has a solid stepping stone (prevents falling)
  hasSolidSteppingStone(x: number, y: number): boolean {
    const stone = this.getEntityAt(x, y, EntityType.STEPPING_STONE);
    if (!stone) return false;

    // Check if stepping stone is solid by calling its isSolid method
    // We need to cast it to access the isSolid method specific to SteppingStone
    return (stone as any).isSolid?.() || false;
  }

  // Check if entity would fall into a hole at this position
  wouldFallIntoHole(x: number, y: number): boolean {
    return this.hasHole(x, y) && !this.hasSolidSteppingStone(x, y);
  }
}
