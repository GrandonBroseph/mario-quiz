define({
	size: {
		x: 32,
		y: 16
	},
	spawn: {
		x: 2.5,
		y: 11
	},
	map: [
		"<X>{}_==#",
		"(^);:,||O",
		"E93 ?@@@+"
	],
	attributes: {
		solid: "=|#O?+",
		nudge: "?+",
		break: "+",
		front: "=|?+",
		animation: {
			"?": [
				[0, 0, 20],
				[1, 0, 6],
				[2, 0, 8],
				[1, 0, 6]
			]
		}
	},
	structure: [
		"                                ",
		"                       (^^^)    ",
		"(^)                    E9993    ",
		"E93   +?+  +?+  +?+  +?+  +?+   ",
		"                (^^)            ",
		"                E993          (^",
		" (^^^)                        E9",
		" E9993 +?+  +?+  +?+  +?+  +?+  ",
		"                                ",
		"                                ",
		"                                ",
		"      +?+  +?+  +?+  +?+  +?+   ",
		"  ==                    _       ",
		"  ||      _            {;}      ",
		"  ||<XXX>{;}     <X>  {;,:} <XX>",
		"################################",
		"################################"
	]
})