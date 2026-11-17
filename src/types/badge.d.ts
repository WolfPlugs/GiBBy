export interface Badge {
	name: string;
	badge: string;
	pending?: boolean;
	// 1 = Common, 2 = Rare, 3 = Epic, 5 = Mythic
	rarity?: 1 | 2 | 3 | 5;
}
