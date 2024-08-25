import "@unocss/reset/tailwind.css";
import "virtual:uno.css";

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import Header from "./components/Header";

export default function App() {
	return (
		<Router
			root={(props) => (
				<>
					<div class="flex min-h-screen w-full flex-col bg-background">
						<Header />
						<div class="flex flex-1 overflow-hidden">
							<div class="hidden w-64 flex-col border-r bg-muted/40 p-4 sm:flex">
								<div class="flex items-center gap-2 pb-4">
									<h2 class="text-lg font-semibold">我的图书馆</h2>
								</div>
								<Nav />
							</div>

							<Suspense>{props.children}</Suspense>
						</div>
					</div>
				</>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
