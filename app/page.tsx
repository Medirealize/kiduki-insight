import { redirect } from "next/navigation";

// / → /ja にリダイレクト（next-intl が localePrefix: "always" で管理）
export default function RootPage() {
  redirect("/ja");
}
