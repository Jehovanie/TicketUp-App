import { ICategory } from "./ICategory";
import { IEventLocation } from "./IEventLocation";
import { ITicketType } from "./ITicketType";
import { IOrganizer } from "./IOrganizer";

export interface IEvent {
	"@context"?: string;
	"@id"?: string;
	"@type"?: string;
	id: number;
	title: string;
	description: string;
	startedAt: string;
	endAt: string;
	imageUrl?: string[];
	createdAt?: string;
	updatedAt?: string;
	status: boolean;
	location: Partial<IEventLocation>;
	ticket_type: ITicketType[];
	category: Partial<ICategory>;
	organizer: IOrganizer;
}
