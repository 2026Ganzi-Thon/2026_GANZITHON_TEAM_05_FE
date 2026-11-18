/** 입력창 아래 안내 문구 (아이디 중복, 비밀번호 불일치 등) */
export default function FieldMessage({ children }: { children: string }) {
  return (
    <p role="alert" className="-mt-[15px] px-[5px] text-caption font-medium text-ink/50">
      {children}
    </p>
  )
}
