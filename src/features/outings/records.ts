import type { OutingRecord } from './types'

/** 저장 버튼의 이벤트에서만 호출한다. API 연결 시 서버의 ID·생성 시각으로 교체한다. */
export function createOutingRecord(
  input: Omit<OutingRecord, 'id' | 'createdAt'> & { id?: string | null },
): OutingRecord {
  return { ...input, id: input.id ?? crypto.randomUUID(), createdAt: new Date().toISOString() }
}
