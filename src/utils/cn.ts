import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/** @theme에 추가한 토큰을 tailwind-merge가 알 수 있게 등록 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['title', 'heading', 'body', 'caption'] }],
      rounded: [{ rounded: ['chip', 'button', 'card', 'popup'] }],
    },
  },
})

/** className 합치기. 뒤에 오는 클래스가 앞의 같은 종류 클래스를 덮어쓴다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
