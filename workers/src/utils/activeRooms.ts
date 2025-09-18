import { ActiveRoomInfo } from '../types';

const ACTIVE_ROOMS_CACHE_KEY = 'active_rooms';
const DEFAULT_TTL_SECONDS = 3600;

async function readActiveRooms(cache: KVNamespace): Promise<ActiveRoomInfo[]> {
  if (!cache) return [];
  const raw = await cache.get(ACTIVE_ROOMS_CACHE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ActiveRoomInfo[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Failed to parse active rooms cache', error);
    return [];
  }
}

async function writeActiveRooms(cache: KVNamespace, rooms: ActiveRoomInfo[]): Promise<void> {
  if (!cache) return;
  await cache.put(
    ACTIVE_ROOMS_CACHE_KEY,
    JSON.stringify(rooms),
    { expirationTtl: DEFAULT_TTL_SECONDS }
  );
}

export async function getActiveRooms(cache: KVNamespace): Promise<ActiveRoomInfo[]> {
  return readActiveRooms(cache);
}

export async function upsertActiveRoom(cache: KVNamespace, room: ActiveRoomInfo): Promise<void> {
  if (!cache) return;
  const rooms = await readActiveRooms(cache);
  const index = rooms.findIndex((item) => item.roomId === room.roomId);
  const nextRoom: ActiveRoomInfo = {
    ...room,
    updatedAt: room.updatedAt || new Date().toISOString(),
  };
  if (index >= 0) {
    rooms[index] = nextRoom;
  } else {
    rooms.push(nextRoom);
  }
  await writeActiveRooms(cache, rooms);
}

export async function removeActiveRoom(cache: KVNamespace, roomId: string): Promise<void> {
  if (!cache) return;
  const rooms = await readActiveRooms(cache);
  const filtered = rooms.filter((room) => room.roomId !== roomId);
  if (filtered.length === rooms.length) {
    return;
  }
  await writeActiveRooms(cache, filtered);
}

