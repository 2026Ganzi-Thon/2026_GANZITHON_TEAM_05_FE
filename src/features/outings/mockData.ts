import {
  MOOD_OPTIONS,
  ENERGY_OPTIONS,
  BARRIER_OPTIONS,
  DISTANCE_OPTIONS,
  DURATION_OPTIONS,
  BUDGET_OPTIONS,
} from '@/constants/options'
import type { Conditions, Energy, Mission, Place, ReviewDraft } from './types'

export const moodOptions = MOOD_OPTIONS.map((option) => option.label)
export const energyOptions = ENERGY_OPTIONS.map((option) => option.label)
export const barrierOptions = BARRIER_OPTIONS.map((option) => option.label)
export const problemOptions = [
  '눈/비가 와요',
  '장소가 문을 닫았어요',
  '사람이 많아요',
  '외출할 에너지가 부족해요',
  '비용이 부담스러워요',
  '기타',
]
export const reviewMoodOptions = [
  '조금 나아졌어요',
  '이전과 비슷해요',
  '오히려 피곤해요',
  '잘 모르겠어요',
]
export const conditionGroups = [
  {
    key: 'distance',
    label: '이동 가능 거리',
    options: DISTANCE_OPTIONS.map((option) => option.label),
  },
  {
    key: 'time',
    label: '사용 가능한 시간',
    options: DURATION_OPTIONS.map((option) => option.label),
  },
  {
    key: 'budget',
    label: '사용 가능한 예산',
    options: BUDGET_OPTIONS.map((option) => option.label),
  },
] as const
export const emptyConditions: Conditions = {
  mood: null,
  energy: null,
  barriers: [],
  distance: null,
  time: null,
  budget: null,
}
export const defaultConditions: Conditions = {
  mood: null,
  energy: 1,
  barriers: [],
  distance: '10분 이내',
  time: '30분',
  budget: '5,000원 이하',
}
export const emptyReview: ReviewDraft = {
  mood: null,
  note: '',
  retry: '',
  good: '',
}

const outsideSteps = ['신발 신기', '현관 밖으로 나가기']
export const missions: Mission[] = [
  {
    id: 'window',
    title: '창문 열고 바깥 공기 쐬기',
    description: '창문을 열고 잠깐 바깥 공기를 느껴보세요',
    level: 0,
    steps: [
      '창문 앞에 가기',
      '창문 열기',
      '바깥 공기 느껴보기',
      '천천히 숨 세 번 쉬기',
      '창문 닫기',
    ],
    distance: '집 안',
    time: '3분',
    budget: '0원',
  },
  {
    id: 'door-inside',
    title: '현관 앞에 서 있기',
    description: '문을 열지 않아도 괜찮아요',
    level: 0,
    steps: [
      '현관 앞에 가기',
      '편하게 서 있기',
      '천천히 숨 세 번 쉬기',
      '문 너머 소리 들어보기',
      '편한 자리로 돌아오기',
    ],
    distance: '집 안',
    time: '3분',
    budget: '0원',
  },
  {
    id: 'door',
    title: '현관 밖으로 나가기',
    description: '문 앞에 잠깐 서 있는 것부터 해봐요',
    level: 1,
    steps: [...outsideSteps, '바깥 공기 느껴보기', '주변 소리 들어보기', '집으로 돌아오기'],
    distance: '도보 1분',
    time: '5분',
    budget: '0원',
  },
  {
    id: 'building',
    title: '건물 주변 잠깐 걷기',
    description: '익숙한 건물 주변만 걸어봐요',
    level: 1,
    steps: [...outsideSteps, '건물 입구까지 가기', '건물 주변 잠깐 걷기', '집으로 돌아오기'],
    distance: '도보 3분',
    time: '10분',
    budget: '0원',
  },
  {
    id: 'store',
    title: '집 앞 편의점 다녀오기',
    description: '가까운 편의점에서 새로운 간식을 골라봐요',
    level: 2,
    steps: [...outsideSteps, '편의점 앞까지 가기', '편의점에서 물건 구매하기', '집으로 돌아오기'],
    distance: '도보 5분',
    time: '15분',
    budget: '3,000원',
    placeType: 'store',
  },
  {
    id: 'walk',
    title: '동네 한 바퀴 걷기',
    description: '정해둔 곳 없이 집 근처를 걸어봐요',
    level: 2,
    steps: [...outsideSteps, '익숙한 골목까지 가기', '동네 한 바퀴 걷기', '집으로 돌아오기'],
    distance: '도보 5분',
    time: '15분',
    budget: '0원',
  },
  {
    id: 'photo',
    title: '동네 풍경 사진 찍기',
    description: '마음에 드는 풍경을 한 장 남겨봐요',
    level: 2,
    steps: [...outsideSteps, '마음에 드는 풍경 찾기', '사진 한 장 찍기', '집으로 돌아오기'],
    distance: '도보 5분',
    time: '15분',
    budget: '0원',
  },
  {
    id: 'park',
    title: '공원에서 음악 세 곡 듣기',
    description: '가까운 공원에서 좋아하는 음악을 들어요',
    level: 3,
    steps: [...outsideSteps, '도산공원 도착하기', '마음에 드는 음악 선택하기', '집으로 돌아오기'],
    distance: '도보 4분',
    time: '20분',
    budget: '0원',
    placeType: 'park',
  },
  {
    id: 'cafe',
    title: '한산한 카페에서 15분 쉬기',
    description: '사람이 적은 카페에서 음료를 마셔요',
    level: 3,
    steps: [...outsideSteps, '카페 도착하기', '음료와 함께 15분 쉬기', '집으로 돌아오기'],
    distance: '도보 7분',
    time: '30분',
    budget: '5,000원',
    placeType: 'cafe',
  },
  {
    id: 'long-walk',
    title: '조금 더 먼 공원 산책하기',
    description: '새로운 길에서 작은 풍경을 찾아봐요',
    level: 4,
    steps: [...outsideSteps, '청담근린공원 도착하기', '공원 산책로 걷기', '집으로 돌아오기'],
    distance: '도보 15분',
    time: '40분',
    budget: '0원',
    placeType: 'park',
  },
  {
    id: 'cafe-far',
    title: '새로운 카페에서 잠깐 쉬기',
    description: '가보고 싶던 카페에서 쉬어가요',
    level: 4,
    steps: [...outsideSteps, '카페 도착하기', '음료와 함께 잠깐 쉬기', '집으로 돌아오기'],
    distance: '도보 15분',
    time: '45분',
    budget: '5,000원',
    placeType: 'cafe',
  },
  {
    id: 'breathe',
    title: '창가에서 천천히 숨 쉬기',
    description: '편한 자리에서 바깥 풍경을 바라봐요',
    level: 0,
    steps: [
      '창가로 가기',
      '편하게 앉기',
      '바깥 풍경 바라보기',
      '천천히 숨 세 번 쉬기',
      '편한 자리로 돌아오기',
    ],
    distance: '집 안',
    time: '3분',
    budget: '0원',
  },
  {
    id: 'entrance',
    title: '건물 입구에서 바람 느끼기',
    description: '익숙한 곳에서 잠깐 쉬어가요',
    level: 1,
    steps: [...outsideSteps, '건물 입구까지 가기', '바깥 바람 느끼기', '집으로 돌아오기'],
    distance: '도보 2분',
    time: '5분',
    budget: '0원',
  },
  {
    id: 'bench',
    title: '공원 벤치에서 잠깐 쉬기',
    description: '한산한 공원에서 주변 소리를 들어요',
    level: 3,
    steps: [...outsideSteps, '도산공원 도착하기', '벤치에 앉아 주변 소리 듣기', '집으로 돌아오기'],
    distance: '도보 4분',
    time: '20분',
    budget: '0원',
    placeType: 'park',
  },
  {
    id: 'trees',
    title: '새로운 산책길 찾아보기',
    description: '조금 먼 공원에서 천천히 걸어봐요',
    level: 4,
    steps: [...outsideSteps, '청담근린공원 도착하기', '새로운 산책길 걸어보기', '집으로 돌아오기'],
    distance: '도보 15분',
    time: '40분',
    budget: '0원',
    placeType: 'park',
  },
]
export const missionById = (id: string): Mission => missions.find((m) => m.id === id) ?? missions[4]
export const missionTitles = [
  '집 안에서 해볼 수 있는\n미션이에요',
  '현관 밖까지\n가볍게 시작해요',
  '지금 할 수 있는\n미션을 골라보세요',
  '가까운 곳에서\n잠깐 머물러볼까요?',
  '조금 더 넓은 곳으로\n나가볼까요?',
]
export function recommendMissions(level: Energy, turn = 0): Mission[] {
  const matches = missions.filter((m) => m.level === level)
  return Array.from(
    { length: Math.min(2, matches.length) },
    (_, i) => matches[(i + turn) % matches.length],
  )
}
export function alternativeMissions(level: Energy, currentId: string, turn = 0): Mission[] {
  const matches = missions.filter((m) => m.level === level && m.id !== currentId)
  return Array.from(
    { length: Math.min(2, matches.length) },
    (_, i) => matches[(i + turn) % matches.length],
  )
}
export const parks: Place[] = [
  {
    id: 'dosan',
    name: '도산공원',
    distance: '550m',
    walk: '도보 4분',
    address: '서울특별시 강남구 도산대로45길 20',
  },
  {
    id: 'cheongdam',
    name: '청담근린공원',
    distance: '780m',
    walk: '도보 5분',
    address: '서울특별시 강남구 영동대로131길 26',
  },
]
export const store: Place = {
  id: 'cu',
  name: 'CU 신사신구점',
  distance: '600m',
  walk: '도보 5분',
  address: '서울특별시 강남구 압구정로36길 12',
}
export const cafes: Place[] = [
  {
    id: 'cafe-1',
    name: '작은 숲 카페',
    distance: '600m',
    walk: '도보 7분',
    address: '서울특별시 강남구 도산대로45길 20',
  },
  {
    id: 'cafe-2',
    name: '오후의 카페',
    distance: '800m',
    walk: '도보 9분',
    address: '서울특별시 강남구 압구정로36길 12',
  },
]
