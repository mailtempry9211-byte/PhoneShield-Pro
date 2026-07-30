import {
  Squares2X2Icon,
  DevicePhoneMobileIcon,
  PlusCircleIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType } from "react";

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
}

export const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: Squares2X2Icon, exact: true }],
  },
  {
    heading: "Stock",
    items: [
      { label: "Inventory", to: "/inventory", icon: DevicePhoneMobileIcon, exact: true },
      { label: "Add Phone", to: "/inventory/add", icon: PlusCircleIcon },
    ],
  },
  {
    heading: "People",
    items: [
      { label: "Sellers", to: "/sellers", icon: BuildingStorefrontIcon },
      { label: "Customers", to: "/customers", icon: UsersIcon, exact: true },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Repairs", to: "/repairs", icon: WrenchScrewdriverIcon, exact: true },
      { label: "Invoices", to: "/invoices", icon: DocumentTextIcon, exact: true },
      { label: "WhatsApp", to: "/whatsapp", icon: ChatBubbleLeftRightIcon },
      { label: "Reports", to: "/reports", icon: ChartBarIcon },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Settings", to: "/settings", icon: Cog6ToothIcon },
      { label: "Profile", to: "/profile", icon: UserCircleIcon },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  add: "Add Phone",
  sellers: "Sellers",
  customers: "Customers",
  repairs: "Repairs",
  invoices: "Invoices",
  whatsapp: "WhatsApp",
  reports: "Reports",
  settings: "Settings",
  profile: "Profile",
};

export function breadcrumbsFor(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => ({
    label: LABELS[segment] ?? (segment.length > 12 ? `#${segment.slice(-6)}` : segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
    last: index === segments.length - 1,
  }));
}
