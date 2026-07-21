import {
    NavigationMenu,
    NavigationMenuTrigger,
} from "@/registry/ui/navigation-menu"


const NavigationMenuComponent = () => {
    return (
        <NavigationMenu>

            <NavigationMenuTrigger as="a" href="/">
                Home
            </NavigationMenuTrigger>
            <NavigationMenuTrigger as="a" href="/novel">
                小说
            </NavigationMenuTrigger>
        </NavigationMenu>
    )
}

export default NavigationMenuComponent
