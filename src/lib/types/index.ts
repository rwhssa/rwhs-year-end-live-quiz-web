export interface SchoolClass {
	name: string;
	score: number;
}

export interface QuestionResult {
	round: number;
	option_percentages: {
		[option_id: string]: number;
	};
	top_3_classes: SchoolClass[];
}

export interface QuizStatus {
	is_active?: boolean;
	round?: number;
	num_students?: number;
	remaining_time?: number;
}
