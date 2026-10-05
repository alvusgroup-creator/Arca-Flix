import type { Metadata } from "next"
import { PageHeader } from "@/components/shared/page-header"
import { CategoryManager } from "@/features/admin/components/category-manager"
import { listAdminCategories } from "@/services/admin-content"

export const metadata: Metadata = { title: "Categorias" }

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories()
  return (
    <div className="space-y-6">
      <PageHeader title="Categorias" />
      <CategoryManager categories={categories} />
    </div>
  )
}
