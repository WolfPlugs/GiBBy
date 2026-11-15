export interface Badge {
	name: string;
	badge: string;
	pending?: boolean;
	// Equicord BadgeRarity values for Epic and Mythic.
	rarity?: 3 | 5;
}
