import {
	Slider,
	SliderFill,
	SliderThumb,
	SliderTrack,
} from "@/registry/ui/slider";
import { Accessor, Setter } from "solid-js";

type ReaderSliderProps = {
	value: Accessor<number>;
	max: Accessor<number>;
	change: Setter<number>;
};
const ReaderSlider = (props: ReaderSliderProps) => {
	return (
		<Slider
			defaultValue={[0]}
			step={1}
			value={[props.value()]}
			maxValue={props.max() - 1}
			class="w-[60%]"
			onChange={(v) => {
				props.change(v[0]);
			}}
			minValue={1}
		>
			<SliderTrack>
				<SliderFill />
				<SliderThumb />
			</SliderTrack>
		</Slider>
	);
};

export default ReaderSlider;
