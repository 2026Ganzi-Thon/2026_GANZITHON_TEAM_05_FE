/** 도감 꽃 18종 (획득 순서). 원본 보유·미보유 SVG: src/assets/flower-icons */
export const FLOWERS = [
  { id: 1, name: '칼라', description: '단정하고 우아한 선처럼 주변 분위기까지 환하게 밝혀줘요.' },
  { id: 2, name: '아이리스', description: '기분 좋은 영감과 희망찬 에너지를 불어넣어요.' },
  {
    id: 3,
    name: '아마릴리스',
    description: '망설임 없이 나아갈 수 있는 당당한 용기를 북돋아 줘요.',
  },
  { id: 4, name: '작약', description: '포근하고 다정한 온기로 마음을 넉넉하게 채워줘요.' },
  { id: 5, name: '튤립', description: '햇살처럼 밝고 유쾌한 설렘을 안겨줘요.' },
  { id: 6, name: '델피니움', description: '높이 뻗은 꽃대처럼 답답한 마음을 시원하게 틔워줘요.' },
  {
    id: 7,
    name: '프로테아',
    description: '어떤 변화 앞에서도 흔들리지 않는 단단한 기개를 보여줘요.',
  },
  {
    id: 8,
    name: '헬레보루스',
    description: '추위를 이겨내고 피어나는 꽃처럼 묵묵히 버텨낼 힘이 돼요.',
  },
  {
    id: 9,
    name: '다알리아',
    description: '풍성하게 피어난 꽃잎만큼이나 반짝이는 기쁨을 선물해요.',
  },
  { id: 10, name: '스톡', description: '은은하게 퍼지는 향기처럼 지친 마음을 차분히 다독여줘요.' },
  {
    id: 11,
    name: '라넌큘러스',
    description: '겹겹이 쌓인 꽃잎처럼 다정하고 세심한 애정이 담겨 있어요.',
  },
  { id: 12, name: '칼라', description: '깨끗하고 군더더기 없는 마음으로 새로운 시작을 응원해요.' },
  { id: 13, name: '장미', description: '꾸밈없이 진실하고 따뜻한 마음을 전해줘요.' },
  { id: 14, name: '튤립', description: '망설임 없이 진심을 표현할 수 있는 따뜻한 확신이 돼요.' },
  {
    id: 15,
    name: '수국',
    description: '풍성하게 모인 꽃송이처럼 주변과의 조화로운 온기를 만들어줘요.',
  },
  {
    id: 16,
    name: '카네이션',
    description: '평소 전하지 못했던 깊은 감사와 존경의 마음이 깃들어 있어요.',
  },
  {
    id: 17,
    name: '튤립',
    description: '차분하면서도 깊이 있는 매력으로 일상에 기분 좋은 여운을 남겨요.',
  },
  { id: 18, name: '국화', description: '복잡한 생각을 비워내고 고요한 평안을 찾게 해줘요.' },
] as const

export type FlowerId = (typeof FLOWERS)[number]['id']
