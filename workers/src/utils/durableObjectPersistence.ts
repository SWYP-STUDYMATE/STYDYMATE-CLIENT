/**
 * Durable Objects 상태 영속성 유틸리티
 * - 상태 백업 및 복구
 * - 주기적 스냅샷
 * - 데이터 무결성 검증
 */

// Cloudflare Workers Durable Objects 타입
type DurableObjectState = any;

export interface StateSnapshot<T = any> {
  timestamp: string;
  version: number;
  data: T;
  checksum: string;
}

export interface PersistenceOptions {
  snapshotInterval?: number; // 스냅샷 간격 (ms)
  maxSnapshots?: number; // 최대 스냅샷 개수
  enableChecksums?: boolean; // 체크섬 검증
  backupToR2?: boolean; // R2 백업 활성화
}

/**
 * Durable Object 상태 관리 클래스
 */
export class DurableObjectPersistenceManager<T = any> {
  private state: DurableObjectState;
  private options: Required<PersistenceOptions>;
  private snapshotTimer: number | null = null;
  private readonly STATE_KEY = 'do_state';
  private readonly SNAPSHOTS_KEY = 'do_snapshots';
  private readonly VERSION_KEY = 'do_version';

  constructor(state: DurableObjectState, options: PersistenceOptions = {}) {
    this.state = state;
    this.options = {
      snapshotInterval: options.snapshotInterval || 60000, // 기본 1분
      maxSnapshots: options.maxSnapshots || 10,
      enableChecksums: options.enableChecksums !== false,
      backupToR2: options.backupToR2 || false,
    };
  }

  /**
   * 상태 저장
   * @param data - 저장할 데이터
   */
  async saveState(data: T): Promise<void> {
    try {
      const version = await this.incrementVersion();
      const snapshot: StateSnapshot<T> = {
        timestamp: new Date().toISOString(),
        version,
        data,
        checksum: this.options.enableChecksums ? await this.calculateChecksum(data) : '',
      };

      // 메인 상태 저장
      await this.state.storage.put(this.STATE_KEY, snapshot);

      // 스냅샷 히스토리에 추가
      await this.addSnapshot(snapshot);

      console.log(`[DO Persistence] State saved (version: ${version})`);
    } catch (error) {
      console.error('[DO Persistence] Failed to save state:', error);
      throw error;
    }
  }

  /**
   * 상태 로드
   * @returns 저장된 상태 데이터
   */
  async loadState(): Promise<T | null> {
    try {
      const snapshot = await this.state.storage.get<StateSnapshot<T>>(this.STATE_KEY);

      if (!snapshot) {
        console.log('[DO Persistence] No saved state found');
        return null;
      }

      // 체크섬 검증
      if (this.options.enableChecksums && snapshot.checksum) {
        const isValid = await this.verifyChecksum(snapshot.data, snapshot.checksum);
        if (!isValid) {
          console.error('[DO Persistence] Checksum validation failed');
          // 최신 스냅샷에서 복구 시도
          return await this.restoreFromSnapshot();
        }
      }

      console.log(`[DO Persistence] State loaded (version: ${snapshot.version})`);
      return snapshot.data;
    } catch (error) {
      console.error('[DO Persistence] Failed to load state:', error);
      return null;
    }
  }

  /**
   * 스냅샷 추가
   * @param snapshot - 스냅샷 데이터
   */
  private async addSnapshot(snapshot: StateSnapshot<T>): Promise<void> {
    const snapshots = (await this.state.storage.get<StateSnapshot<T>[]>(this.SNAPSHOTS_KEY)) || [];

    // 새 스냅샷 추가
    snapshots.push(snapshot);

    // 최대 개수 초과 시 오래된 것 제거
    if (snapshots.length > this.options.maxSnapshots) {
      snapshots.splice(0, snapshots.length - this.options.maxSnapshots);
    }

    await this.state.storage.put(this.SNAPSHOTS_KEY, snapshots);
  }

  /**
   * 스냅샷에서 복구
   * @param version - 특정 버전 (선택사항)
   * @returns 복구된 데이터
   */
  async restoreFromSnapshot(version?: number): Promise<T | null> {
    try {
      const snapshots = (await this.state.storage.get<StateSnapshot<T>[]>(this.SNAPSHOTS_KEY)) || [];

      if (snapshots.length === 0) {
        console.log('[DO Persistence] No snapshots available for restoration');
        return null;
      }

      // 특정 버전 또는 최신 스냅샷 찾기
      let targetSnapshot: StateSnapshot<T> | undefined;

      if (version !== undefined) {
        targetSnapshot = snapshots.find((s: StateSnapshot<T>) => s.version === version);
      } else {
        targetSnapshot = snapshots[snapshots.length - 1];
      }

      if (!targetSnapshot) {
        console.error(`[DO Persistence] Snapshot version ${version} not found`);
        return null;
      }

      // 체크섬 검증
      if (this.options.enableChecksums && targetSnapshot.checksum) {
        const isValid = await this.verifyChecksum(targetSnapshot.data, targetSnapshot.checksum);
        if (!isValid) {
          console.error('[DO Persistence] Snapshot checksum validation failed');
          return null;
        }
      }

      console.log(`[DO Persistence] Restored from snapshot (version: ${targetSnapshot.version})`);
      return targetSnapshot.data;
    } catch (error) {
      console.error('[DO Persistence] Failed to restore from snapshot:', error);
      return null;
    }
  }

  /**
   * 모든 스냅샷 조회
   * @returns 스냅샷 목록
   */
  async listSnapshots(): Promise<StateSnapshot<T>[]> {
    return (await this.state.storage.get<StateSnapshot<T>[]>(this.SNAPSHOTS_KEY)) || [];
  }

  /**
   * 특정 스냅샷 삭제
   * @param version - 삭제할 버전
   */
  async deleteSnapshot(version: number): Promise<void> {
    const snapshots = (await this.state.storage.get<StateSnapshot<T>[]>(this.SNAPSHOTS_KEY)) || [];
    const filtered = snapshots.filter((s: StateSnapshot<T>) => s.version !== version);
    await this.state.storage.put(this.SNAPSHOTS_KEY, filtered);
    console.log(`[DO Persistence] Deleted snapshot version ${version}`);
  }

  /**
   * 모든 상태 초기화
   */
  async clearAll(): Promise<void> {
    await this.state.storage.deleteAll();
    console.log('[DO Persistence] All state cleared');
  }

  /**
   * 상태 내보내기 (JSON)
   * @returns JSON 문자열
   */
  async exportState(): Promise<string> {
    const snapshot = await this.state.storage.get<StateSnapshot<T>>(this.STATE_KEY);
    const snapshots = await this.state.storage.get<StateSnapshot<T>[]>(this.SNAPSHOTS_KEY);
    const version = await this.state.storage.get<number>(this.VERSION_KEY);

    return JSON.stringify(
      {
        current: snapshot,
        history: snapshots,
        version,
      },
      null,
      2
    );
  }

  /**
   * 상태 가져오기 (JSON)
   * @param json - JSON 문자열
   */
  async importState(json: string): Promise<void> {
    try {
      const imported = JSON.parse(json);

      if (imported.current) {
        await this.state.storage.put(this.STATE_KEY, imported.current);
      }

      if (imported.history) {
        await this.state.storage.put(this.SNAPSHOTS_KEY, imported.history);
      }

      if (imported.version) {
        await this.state.storage.put(this.VERSION_KEY, imported.version);
      }

      console.log('[DO Persistence] State imported successfully');
    } catch (error) {
      console.error('[DO Persistence] Failed to import state:', error);
      throw error;
    }
  }

  /**
   * 주기적 스냅샷 시작
   */
  startAutoSnapshot(getData: () => T): void {
    if (this.snapshotTimer) {
      return;
    }

    this.snapshotTimer = setInterval(async () => {
      try {
        const data = getData();
        await this.saveState(data);
        console.log('[DO Persistence] Auto snapshot created');
      } catch (error) {
        console.error('[DO Persistence] Auto snapshot failed:', error);
      }
    }, this.options.snapshotInterval) as unknown as number;
  }

  /**
   * 주기적 스냅샷 중지
   */
  stopAutoSnapshot(): void {
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
      this.snapshotTimer = null;
      console.log('[DO Persistence] Auto snapshot stopped');
    }
  }

  /**
   * 버전 증가
   * @returns 새 버전 번호
   */
  private async incrementVersion(): Promise<number> {
    const currentVersion = (await this.state.storage.get<number>(this.VERSION_KEY)) || 0;
    const newVersion = currentVersion + 1;
    await this.state.storage.put(this.VERSION_KEY, newVersion);
    return newVersion;
  }

  /**
   * 체크섬 계산
   * @param data - 데이터
   * @returns 체크섬 (SHA-256)
   */
  private async calculateChecksum(data: T): Promise<string> {
    const json = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(json);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 체크섬 검증
   * @param data - 데이터
   * @param expectedChecksum - 예상 체크섬
   * @returns 검증 결과
   */
  private async verifyChecksum(data: T, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.calculateChecksum(data);
    return actualChecksum === expectedChecksum;
  }
}

/**
 * Durable Object 상태 백업 (R2)
 */
export async function backupToR2<T>(
  r2Bucket: R2Bucket,
  objectId: string,
  data: T
): Promise<void> {
  try {
    const key = `do-backups/${objectId}/${Date.now()}.json`;
    const json = JSON.stringify(data);

    await r2Bucket.put(key, json, {
      httpMetadata: {
        contentType: 'application/json',
      },
      customMetadata: {
        objectId,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`[DO Backup] Backed up to R2: ${key}`);
  } catch (error) {
    console.error('[DO Backup] Failed to backup to R2:', error);
    throw error;
  }
}

/**
 * R2에서 복구
 */
export async function restoreFromR2<T>(
  r2Bucket: R2Bucket,
  objectId: string,
  timestamp?: number
): Promise<T | null> {
  try {
    // 최신 백업 또는 특정 타임스탬프 백업 찾기
    const prefix = `do-backups/${objectId}/`;
    const list = await r2Bucket.list({ prefix });

    if (list.objects.length === 0) {
      console.log('[DO Backup] No backups found in R2');
      return null;
    }

    // 타임스탬프 정렬 (최신순)
    const sorted = list.objects.sort((a, b) => {
      const aTime = parseInt(a.key.split('/').pop()?.replace('.json', '') || '0');
      const bTime = parseInt(b.key.split('/').pop()?.replace('.json', '') || '0');
      return bTime - aTime;
    });

    const targetKey = timestamp
      ? `${prefix}${timestamp}.json`
      : sorted[0].key;

    const object = await r2Bucket.get(targetKey);

    if (!object) {
      console.error('[DO Backup] Backup not found in R2');
      return null;
    }

    const json = await object.text();
    const data = JSON.parse(json);

    console.log(`[DO Backup] Restored from R2: ${targetKey}`);
    return data;
  } catch (error) {
    console.error('[DO Backup] Failed to restore from R2:', error);
    return null;
  }
}
