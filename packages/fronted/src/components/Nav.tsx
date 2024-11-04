import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuItemLabel,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";

export default function Nav() {
  return (
    <NavigationMenu>
      <NavigationMenuTrigger
        as="a"
        href="/"
        class="transition-[box-shadow,background-color] focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring data-[expanded]:bg-accent"
      >
        首页
      </NavigationMenuTrigger>
      <NavigationMenuTrigger
        as="a"
        href="/articles"
        class="transition-[box-shadow,background-color] focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring data-[expanded]:bg-accent"
      >
        列表
      </NavigationMenuTrigger>
      <NavigationMenuTrigger
        as="a"
        href="/articles/create"
        class="transition-[box-shadow,background-color] focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring data-[expanded]:bg-accent"
      >
        新建
      </NavigationMenuTrigger>
    </NavigationMenu>
  );
}
