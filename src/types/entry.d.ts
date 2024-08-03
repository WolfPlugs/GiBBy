import type { ObjectId } from "mongodb";
import type { Badge } from "./badge.d.ts";

export interface Entry {
	_id?: ObjectId;
	userId: string;
	badges: Badge[];
	blocked: boolean;
}
