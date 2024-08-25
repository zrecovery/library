import { useLocation } from "@solidjs/router";

export default function Nav() {
	const location = useLocation();
	const active = (path: string) =>
		path == location.pathname
			? "border-sky-600 bg-blue"
			: "border-transparent hover:border-sky-600";
	const navStyle = (path: string) =>
		`${active(path)} flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground`;
	return (
		<nav class="flex flex-col gap-2">
			<a href="/" class={navStyle("/")}>
				<span>主页</span>
			</a>
			<a href="/articles" class={navStyle("/articles")}>
				<span>文章</span>
			</a>
			<a href="/series" class={navStyle("/series")}>
				<span>系列</span>
			</a>
		</nav>
	);
}
