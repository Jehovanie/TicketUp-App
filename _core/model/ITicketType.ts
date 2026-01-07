export interface ITicketType {
	"@context"?: string;
	"@id"?: string;
	"@type"?: string;
	id: number;
	name: string;
	prix: number;
	quantite_max: number;
	createdAt: string;
	updatedAt: string;
}
