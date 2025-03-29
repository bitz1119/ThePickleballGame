export interface TabItem {
  title: string;
  icon: string;
  href: string;
  type?: 'separator';
}

export const navTabs: TabItem[] = [
  { title: "Home", icon: "lucide:home", href: "/" },
  { title: "Blog", icon: "lucide:file-text", href: "/blog" },
  { title: "Courts", icon: "lucide:map-pin", href: "/courts" },
  { type: "separator", title: "", icon: "", href: "" },
  { title: "Equipment", icon: "lucide:shopping-bag", href: "/equipment" },
  { title: "Rules", icon: "lucide:book", href: "/rules" },
  { title: "Techniques", icon: "lucide:award", href: "/techniques" },
]; 