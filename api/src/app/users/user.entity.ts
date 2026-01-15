import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Organization } from "../organizations/organization.entity";
import { Role } from "../common/roles.enum";

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    email:string;

    @Column()
    passwordHash:string;

    @Column({
        type:'text',

    })
    role: Role;

    
    @ManyToOne(() => Organization, {
        eager: true,
        onDelete: 'CASCADE',
            
    })
    organization: Organization;
}