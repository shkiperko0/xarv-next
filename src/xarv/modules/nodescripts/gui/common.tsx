export interface ICirclePointer {
	size?: number
	radius?: number
	stroke?: string
	color?: string
}

export const CirclePointer = (props: ICirclePointer) => {
    const { size = 24, radius = 10, color = "white", stroke = "black" } = props
	return <svg
		height={size}
		width={size}
	>
		<circle 
			cx={size / 2} 
			cy={size / 2} 
			r={radius} 
			stroke={stroke}
			fill={color}		
			strokeWidth={2}
		/>
	</svg>
}
