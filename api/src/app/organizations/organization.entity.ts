import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm'

@Entity()
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string

    // Parent organization (nullable)
    @ManyToOne(() => Organization, (org) => org.children, {
        nullable: true,
        onDelete: 'SET NULL',
    })

    parent?: Organization

    // Child organizations
    @OneToMany(() => Organization, (org) => org.parent)
        children: Organization[];
    
}