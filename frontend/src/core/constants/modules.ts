import {
  LayoutDashboard,
  Users,
  Wrench,
  HardHat,
  Calendar,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react"

export interface NavModule {
  name: string
  path: string
  icon: LucideIcon
  category: "dashboard" | "cadastros" | "operacional" | "configuracoes" | "admin"
  order: number
  adminOnly?: boolean
}

export const NAV_MODULES: NavModule[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    category: "dashboard",
    order: 1,
  },
  {
    name: "Clientes",
    path: "/clients",
    icon: Users,
    category: "cadastros",
    order: 1,
  },
  {
    name: "Modelos de Máquinas",
    path: "/machines/models",
    icon: Wrench,
    category: "cadastros",
    order: 2,
  },
  {
    name: "Máquinas de Clientes",
    path: "/machines/customer",
    icon: Wrench,
    category: "cadastros",
    order: 3,
  },
  {
    name: "Técnicos",
    path: "/technicians",
    icon: HardHat,
    category: "cadastros",
    order: 4,
  },
  {
    name: "Agenda",
    path: "/calendar",
    icon: Calendar,
    category: "operacional",
    order: 1,
  },
  {
    name: "Configurações",
    path: "/settings",
    icon: Settings,
    category: "configuracoes",
    order: 1,
  },
  {
    name: "Administrador",
    path: "/admin/users",
    icon: Shield,
    category: "admin",
    order: 1,
    adminOnly: true,
  },
]
