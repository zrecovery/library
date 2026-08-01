import {
	Pagination,
	PaginationEllipsis,
	PaginationItem,
	PaginationItems,
	PaginationNext,
	PaginationPrevious,
} from "@/registry/ui/pagination";
import { Accessor, Setter } from "solid-js";

const ReaderPagination = (props: {
	count: Accessor<number>;
	setCount: Setter<number>;
	current: Accessor<number>;
}) => (
	<>
		<Pagination
			count={props.count() - 1}
			onPageChange={props.setCount}
			page={props.current()}
			itemComponent={(props) => (
				<PaginationItem page={props.page}>{props.page}</PaginationItem>
			)}
			ellipsisComponent={() => <PaginationEllipsis />}
		>
			<PaginationPrevious />
			<PaginationItems />
			<PaginationNext />
		</Pagination>
	</>
);

export default ReaderPagination;
