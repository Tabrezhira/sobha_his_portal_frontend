import Image from "next/image"

import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/homeimg.webp')" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-6 px-6">
        <Image src="/logo.svg" alt="Logo" width={120} height={48} />
        <LoginForm />
      </div>
    </div>
  )
}
